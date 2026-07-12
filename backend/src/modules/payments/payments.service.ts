import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { PaymentStatusHistory } from './entities/payment-status-history.entity';
import { OrdersService } from '../bazaar/orders/orders.service';
import { DistributionsService } from '../bazaar/distributions/distributions.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(PaymentStatusHistory)
    private statusHistoryRepo: Repository<PaymentStatusHistory>,
    private ordersService: OrdersService,
    private distributionsService: DistributionsService
  ) {}

  async generatePayment(orderId: number) {
    const order = await this.ordersService.getOrderById(orderId);
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    // Check if payment already exists
    let payment = await this.paymentRepo.findOne({ where: { order: { id: orderId } } });
    if (!payment) {
      const referenceId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      payment = this.paymentRepo.create({
        order: { id: orderId },
        referenceId,
        amount: order.grandTotal,
        status: PaymentStatus.PENDING,
        qrisPayload: `00020101021226590014ID.CO.QRIS.WWW01189360091530182604970214488319089063610303UME51440014ID.CO.QRIS.WWW0215ID10242200194880303UME520454115303360540410005802ID5919SPADM BAZAAR 20266007JAKARTA61051211062220118${referenceId}6304` + Math.floor(Math.random()*9999) // Mock QRIS String
      });
      await this.paymentRepo.save(payment);

      await this.statusHistoryRepo.save(
        this.statusHistoryRepo.create({
          payment: { id: payment.id },
          status: PaymentStatus.PENDING,
          notes: 'QRIS Generated'
        })
      );
    }
    return payment;
  }

  async simulateWebhookSuccess(referenceId: string) {
    const payment = await this.paymentRepo.findOne({ 
      where: { referenceId },
      relations: { order: true }
    });
    
    if (!payment) throw new NotFoundException('Payment tidak ditemukan');
    if (payment.status === PaymentStatus.PAID) return payment;

    payment.status = PaymentStatus.PAID;
    payment.paidAt = new Date();
    await this.paymentRepo.save(payment);

    await this.statusHistoryRepo.save(
      this.statusHistoryRepo.create({
        payment: { id: payment.id },
        status: PaymentStatus.PAID,
        notes: 'Simulated Webhook Success'
      })
    );

    // Update order status
    await this.ordersService.updateOrderStatus(payment.order.id, 'PAID');

    // Generate Pickup Token
    await this.distributionsService.generatePickupToken(payment.order.id);

    return payment;
  }

  async getPaymentByOrder(orderId: number) {
    return this.paymentRepo.findOne({ where: { order: { id: orderId } } });
  }
}
