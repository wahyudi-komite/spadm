import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { LessThan, Repository } from 'typeorm';
import { AuditLogService } from '../audit-logs/audit-log.service';
import { DistributionsService } from '../bazaar/distributions/distributions.service';
import {
  BazaarOrder,
  OrderStatus,
} from '../bazaar/orders/entities/order.entity';
import { BazaarOrderStatusHistory } from '../bazaar/orders/entities/order-status-history.entity';
import { OrdersService } from '../bazaar/orders/orders.service';
import { ManualVerifyPaymentDto } from './dto/manual-verify-payment.dto';
import { ManualPaymentVerification } from './entities/manual-payment-verification.entity';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { PaymentStatusHistory } from './entities/payment-status-history.entity';
import { PaymentWebhookLog } from './entities/payment-webhook-log.entity';
import { PaymentProviderRegistry } from './providers/payment-provider.registry';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentStatusHistory)
    private readonly statusHistoryRepository: Repository<PaymentStatusHistory>,
    @InjectRepository(PaymentWebhookLog)
    private readonly webhookLogRepository: Repository<PaymentWebhookLog>,
    @InjectRepository(ManualPaymentVerification)
    private readonly manualVerificationRepository: Repository<ManualPaymentVerification>,
    private readonly ordersService: OrdersService,
    private readonly distributionsService: DistributionsService,
    private readonly providerRegistry: PaymentProviderRegistry,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async generatePayment(orderId: number, userId: number) {
    const order = await this.ordersService.getOrderById(orderId, userId);
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order tidak dapat dibuatkan pembayaran');
    }

    const existing = await this.paymentRepository.findOne({
      where: { order: { id: orderId } },
    });
    if (existing) return existing;

    const provider = this.providerRegistry.get();
    const referenceId = `PAY-${randomUUID()}`;
    const expiredAt = this.endOfCurrentJakartaDay();
    const providerResult = await provider.createDynamicQris({
      referenceId,
      amount: Number(order.grandTotal),
      expiresAt: expiredAt,
      description: `Pembayaran ${order.orderNumber}`,
    });

    try {
      return await this.paymentRepository.manager.transaction(async (manager) => {
        const duplicate = await manager.findOne(Payment, {
          where: { order: { id: orderId } },
          lock: { mode: 'pessimistic_write' },
        });
        if (duplicate) return duplicate;

        const payment = await manager.save(
          Payment,
          manager.create(Payment, {
            order: { id: orderId },
            referenceId,
            provider: provider.name,
            providerReference: providerResult.providerReference,
            amount: order.grandTotal,
            status: PaymentStatus.PENDING,
            qrisPayload: providerResult.qrisPayload,
            expiredAt,
          }),
        );
        await manager.save(
          PaymentStatusHistory,
          manager.create(PaymentStatusHistory, {
            payment: { id: payment.id },
            status: PaymentStatus.PENDING,
            notes: `QRIS dibuat melalui ${provider.name}`,
          }),
        );
        return payment;
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
        const duplicate = await this.paymentRepository.findOne({
          where: { order: { id: orderId } },
        });
        if (duplicate) return duplicate;
      }
      throw error;
    }
  }

  async manualVerify(
    referenceId: string,
    dto: ManualVerifyPaymentDto,
    adminUserId: number,
  ) {
    const payment = await this.findByReference(referenceId);
    if (Number(payment.amount) !== Number(dto.amount)) {
      throw new BadRequestException('Nominal verifikasi tidak sesuai dengan payment');
    }
    const previousStatus = payment.status;
    const result = await this.markPaid(referenceId, PaymentStatus.MANUAL_VERIFIED);

    await this.manualVerificationRepository.save({
      paymentId: payment.id,
      verifiedBy: adminUserId,
      previousStatus,
      newStatus: PaymentStatus.MANUAL_VERIFIED,
      amount: dto.amount,
      paymentReference: dto.paymentReference,
      reason: dto.reason,
      notes: dto.notes,
    });
    await this.auditLogService.log({
      userId: adminUserId,
      action: 'MANUAL_PAYMENT_VERIFICATION',
      module: 'payments',
      entityType: 'payment',
      entityId: payment.id,
      oldValues: { status: previousStatus },
      newValues: { status: PaymentStatus.MANUAL_VERIFIED },
      description: dto.reason,
    });
    return result;
  }

  async simulateWebhookSuccess(referenceId: string) {
    if (this.configService.get<string>('app.nodeEnv') !== 'development') {
      throw new NotFoundException();
    }
    return this.markPaid(referenceId, PaymentStatus.PAID);
  }

  async processWebhook(
    providerName: string,
    payload: Record<string, unknown>,
    headers: Record<string, string | string[] | undefined>,
  ) {
    const log: PaymentWebhookLog = await this.webhookLogRepository.save(
      this.webhookLogRepository.create({
        provider: providerName,
        eventType: String(payload.eventType || ''),
        externalReference: String(payload.referenceId || ''),
        payload,
        signatureValid: false,
        processingStatus: 'RECEIVED',
      }),
    );

    try {
      const provider = this.providerRegistry.get(providerName);
      const normalized = await provider.verifyAndNormalizeWebhook(payload, headers);
      log.signatureValid = true;
      log.eventType = normalized.eventType;
      log.externalReference = normalized.referenceId;

      const payment = await this.findByReference(normalized.referenceId);
      if (Number(payment.amount) !== Number(normalized.amount)) {
        throw new BadRequestException('Nominal webhook tidak sesuai');
      }

      if (normalized.status === 'PAID') {
        await this.markPaid(normalized.referenceId, PaymentStatus.PAID);
      }
      log.processingStatus = 'PROCESSED';
      log.processedAt = new Date();
      await this.webhookLogRepository.save(log);
      return { received: true };
    } catch (error) {
      log.processingStatus = 'FAILED';
      log.errorMessage = error instanceof Error ? error.message : String(error);
      log.processedAt = new Date();
      await this.webhookLogRepository.save(log);
      throw error;
    }
  }

  async expirePendingPayments(): Promise<number> {
    const payments = await this.paymentRepository.find({
      where: { status: PaymentStatus.PENDING, expiredAt: LessThan(new Date()) },
      relations: { order: true },
    });
    for (const payment of payments) {
      await this.paymentRepository.manager.transaction(async (manager) => {
        await manager.update(Payment, payment.id, { status: PaymentStatus.EXPIRED });
        await manager.update(BazaarOrder, payment.order.id, {
          status: OrderStatus.EXPIRED,
        });
        await manager.save(PaymentStatusHistory, {
          payment: { id: payment.id },
          status: PaymentStatus.EXPIRED,
          notes: 'Pembayaran kedaluwarsa otomatis',
        });
        await manager.save(BazaarOrderStatusHistory, {
          order: { id: payment.order.id },
          status: OrderStatus.EXPIRED,
          notes: 'Pembayaran kedaluwarsa otomatis',
          createdBy: 'SYSTEM',
        });
      });
      await this.notificationsService.notifyPaymentExpired(payment.order.id);
    }
    return payments.length;
  }

  async getPaymentByOrder(orderId: number, userId: number) {
    await this.ordersService.getOrderById(orderId, userId);
    return this.paymentRepository.findOne({ where: { order: { id: orderId } } });
  }

  async getPaymentHistory(userId: number) {
    return this.paymentRepository.find({
      where: { order: { member: { id: userId } } },
      relations: { order: true },
      order: { createdAt: 'DESC' },
    });
  }

  private async findByReference(referenceId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { referenceId },
      relations: { order: true },
    });
    if (!payment) throw new NotFoundException('Payment tidak ditemukan');
    return payment;
  }

  private async markPaid(referenceId: string, status: PaymentStatus) {
    const paymentResult = await this.paymentRepository.manager.transaction(
      async (manager) => {
        const payment = await manager.findOne(Payment, {
          where: { referenceId },
          relations: { order: true },
          lock: { mode: 'pessimistic_write' },
        });
        if (!payment) throw new NotFoundException('Payment tidak ditemukan');
        if ([PaymentStatus.PAID, PaymentStatus.MANUAL_VERIFIED].includes(payment.status)) {
          return { id: payment.id, changed: false };
        }
        if (payment.status === PaymentStatus.EXPIRED) {
          throw new BadRequestException('Payment sudah kedaluwarsa');
        }

        payment.status = status;
        payment.paidAt = new Date();
        await manager.save(payment);
        await manager.save(PaymentStatusHistory, {
          payment: { id: payment.id },
          status,
          notes: status === PaymentStatus.MANUAL_VERIFIED
            ? 'Pembayaran diverifikasi manual'
            : 'Webhook pembayaran berhasil',
        });
        await manager.update(BazaarOrder, payment.order.id, {
          status: OrderStatus.CONFIRMED,
        });
        await manager.save(BazaarOrderStatusHistory, {
          order: { id: payment.order.id },
          status: OrderStatus.CONFIRMED,
          notes: 'Pembayaran berhasil',
          createdBy: 'SYSTEM',
        });
        return { id: payment.id, changed: true };
      },
    );

    const payment = await this.paymentRepository.findOneOrFail({
      where: { id: paymentResult.id },
      relations: { order: true },
    });
    if (paymentResult.changed) {
      await this.distributionsService.generatePickupToken(payment.order.id);
      await this.notificationsService.notifyPaymentSuccess(payment.order.id);
    }
    return payment;
  }

  private endOfCurrentJakartaDay(): Date {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const value = (type: string) =>
      Number(parts.find((part) => part.type === type)?.value);
    return new Date(Date.UTC(value('year'), value('month') - 1, value('day'), 16, 59, 59));
  }
}
