import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BazaarOrder } from '../bazaar/orders/entities/order.entity';
import { DeliveryStatus, NotificationDelivery } from './entities/notification-delivery.entity';
import { Notification, NotificationType } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

interface NotificationInput {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  deepLink?: string;
  metadata?: Record<string, unknown>;
  whatsapp?: { phone: string; template: string; message: string };
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationDelivery)
    private readonly deliveryRepository: Repository<NotificationDelivery>,
    @InjectRepository(BazaarOrder)
    private readonly orderRepository: Repository<BazaarOrder>,
    private readonly gateway: NotificationsGateway,
  ) {}

  async create(input: NotificationInput): Promise<Notification> {
    const notification = await this.notificationRepository.manager.transaction(async (manager) => {
      const savedNotif = await manager.save(Notification, {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        deepLink: input.deepLink || null,
        metadata: input.metadata || null,
      });
      if (input.whatsapp?.phone) {
        await manager.save(NotificationDelivery, {
          notificationId: savedNotif.id,
          channel: 'WHATSAPP',
          recipient: input.whatsapp.phone,
          template: input.whatsapp.template,
          payload: { message: input.whatsapp.message },
          status: DeliveryStatus.PENDING,
          attempts: 0,
        });
      }
      return savedNotif;
    });

    try {
      this.gateway.sendNotification(notification.userId, notification);
      const { count } = await this.unreadCount(notification.userId);
      this.gateway.sendUnreadCount(notification.userId, count);
    } catch (error) {
      // Ignore websocket errors so business logic transaction isn't broken
    }

    return notification;
  }

  async notifyPaymentSuccess(orderId: number): Promise<void> {
    const order = await this.getOrder(orderId);
    const member = order.member;
    const amount = new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
    }).format(Number(order.grandTotal));
    await this.create({
      userId: order.member.id,
      type: NotificationType.PAYMENT_SUCCESS,
      title: 'Pembayaran berhasil',
      message: `Pembayaran ${order.orderNumber} berhasil. QR pengambilan sudah tersedia.`,
      deepLink: `/bazaar/orders/${order.id}`,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
      whatsapp: member.phone ? {
        phone: member.phone,
        template: 'PAYMENT_SUCCESS',
        message: [
          `Halo ${member.name},`, '', 'Pembayaran Bazar SPADM telah berhasil.',
          `Nomor transaksi: ${order.orderNumber}`, `Total pembayaran: ${amount}`,
          `Area pengambilan: ${order.distributionArea?.code || '-'}`, '',
          'QR pengambilan sudah tersedia di aplikasi SPADM.',
          'Pengambilan tidak dapat diwakilkan.', '', 'SPADM',
        ].join('\n'),
      } : undefined,
    });
  }

  async notifyPaymentExpired(orderId: number): Promise<void> {
    const order = await this.getOrder(orderId);
    const member = order.member;
    await this.create({
      userId: order.member.id,
      type: NotificationType.PAYMENT_EXPIRED,
      title: 'Pembayaran kedaluwarsa',
      message: `Pembayaran ${order.orderNumber} telah kedaluwarsa. Hak pembelian Anda tetap tersedia.`,
      deepLink: `/bazaar/orders/${order.id}`,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
      whatsapp: member.phone ? {
        phone: member.phone,
        template: 'PAYMENT_EXPIRED',
        message: `Halo ${member.name},\n\nPembayaran ${order.orderNumber} telah kedaluwarsa. Anda dapat membuat pesanan baru saat batch masih dibuka.\n\nSPADM`,
      } : undefined,
    });
  }

  async notifyOrderDistributed(orderId: number): Promise<void> {
    const order = await this.getOrder(orderId);
    const member = order.member;
    await this.create({
      userId: order.member.id,
      type: NotificationType.ORDER_DISTRIBUTED,
      title: 'Barang telah diserahkan',
      message: `Paket ${order.orderNumber} telah diserahkan. Terima kasih.`,
      deepLink: `/bazaar/orders/${order.id}`,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
      whatsapp: member.phone ? {
        phone: member.phone,
        template: 'ORDER_DISTRIBUTED',
        message: `Halo ${member.name},\n\nPaket bazar ${order.orderNumber} telah diserahkan. Terima kasih.\n\nSPADM`,
      } : undefined,
    });
  }

  async findMine(userId: number, page = 1, limit = 20) {
    const take = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const currentPage = Math.max(Number(page) || 1, 1);
    const [data, total] = await this.notificationRepository.findAndCount({
      where: { userId }, order: { createdAt: 'DESC' },
      skip: (currentPage - 1) * take, take,
    });
    return { data, meta: { total, page: currentPage, limit: take, totalPages: Math.ceil(total / take) } };
  }

  async unreadCount(userId: number) {
    return { count: await this.notificationRepository.count({ where: { userId, isRead: false } }) };
  }

  async markRead(id: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notifikasi tidak ditemukan');
    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await this.notificationRepository.save(notification);
      try {
        const { count } = await this.unreadCount(userId);
        this.gateway.sendUnreadCount(userId, count);
      } catch (error) {}
    }
    return notification;
  }

  async markAllRead(userId: number) {
    const result = await this.notificationRepository.update(
      { userId, isRead: false }, { isRead: true, readAt: new Date() },
    );
    try {
      this.gateway.sendUnreadCount(userId, 0);
    } catch (error) {}
    return { updated: result.affected || 0 };
  }

  async listDeliveries(page = 1, limit = 50) {
    const take = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const currentPage = Math.max(Number(page) || 1, 1);
    const [data, total] = await this.deliveryRepository.findAndCount({
      relations: { notification: true }, order: { createdAt: 'DESC' },
      skip: (currentPage - 1) * take, take,
    });
    return { data, meta: { total, page: currentPage, limit: take } };
  }

  async deliverySummary() {
    const statuses = Object.values(DeliveryStatus);
    const counts = await Promise.all(
      statuses.map((status) => this.deliveryRepository.count({ where: { status } })),
    );
    const byStatus = Object.fromEntries(
      statuses.map((status, index) => [status, counts[index]]),
    ) as Record<DeliveryStatus, number>;

    return {
      total: counts.reduce((sum, count) => sum + count, 0),
      pendingWork:
        byStatus[DeliveryStatus.PENDING]
        + byStatus[DeliveryStatus.PROCESSING]
        + byStatus[DeliveryStatus.RETRY],
      byStatus,
    };
  }

  async retryDelivery(id: number) {
    const retried = await this.deliveryRepository.update(
      { id, status: DeliveryStatus.FAILED },
      {
        status: DeliveryStatus.RETRY,
        attempts: 0,
        nextAttemptAt: new Date(),
        lastError: null,
      },
    );
    if (!retried.affected) {
      const delivery = await this.deliveryRepository.findOne({ where: { id } });
      if (!delivery) throw new NotFoundException('Histori pengiriman tidak ditemukan');
      throw new BadRequestException('Hanya pengiriman berstatus gagal yang dapat diulang');
    }
    return this.deliveryRepository.findOne({ where: { id } });
  }

  private async getOrder(id: number): Promise<BazaarOrder> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { member: true, distributionArea: true },
    });
    if (!order?.member) throw new NotFoundException('Data order atau anggota tidak ditemukan');
    return order;
  }
}
