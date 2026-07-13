import { Inject, Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { DeliveryStatus, NotificationDelivery } from './entities/notification-delivery.entity';
import { WHATSAPP_PROVIDER } from './providers/whatsapp-provider.interface';
import type { WhatsAppProvider } from './providers/whatsapp-provider.interface';

@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);
  private processing = false;

  constructor(
    @InjectRepository(NotificationDelivery)
    private readonly deliveryRepository: Repository<NotificationDelivery>,
    @Inject(WHATSAPP_PROVIDER)
    private readonly whatsappProvider: WhatsAppProvider,
  ) {}

  @Interval(5000)
  async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;
    try {
      const deliveries = await this.deliveryRepository.find({
        where: [
          { status: DeliveryStatus.PENDING },
          { status: DeliveryStatus.RETRY, nextAttemptAt: LessThanOrEqual(new Date()) },
        ],
        order: { createdAt: 'ASC' },
        take: 10,
      });
      for (const delivery of deliveries) await this.processDelivery(delivery);
    } finally {
      this.processing = false;
    }
  }

  private async processDelivery(delivery: NotificationDelivery): Promise<void> {
    const claimed = await this.deliveryRepository.update(
      { id: delivery.id, status: delivery.status },
      { status: DeliveryStatus.PROCESSING, attempts: delivery.attempts + 1 },
    );
    if (!claimed.affected) return;
    try {
      const message = String(delivery.payload.message || '');
      const providerMessageId = await this.whatsappProvider.sendText(delivery.recipient, message);
      await this.deliveryRepository.update(delivery.id, {
        status: DeliveryStatus.SENT,
        providerMessageId,
        sentAt: new Date(),
        lastError: null,
      });
    } catch (error) {
      const attempts = delivery.attempts + 1;
      const lastError = error instanceof Error ? error.message : String(error);
      await this.deliveryRepository.update(delivery.id, {
        status: attempts >= 5 ? DeliveryStatus.FAILED : DeliveryStatus.RETRY,
        lastError,
        nextAttemptAt: attempts >= 5 ? null : new Date(Date.now() + 2 ** attempts * 60_000),
      });
      this.logger.warn(`Pengiriman #${delivery.id} gagal: ${lastError}`);
    }
  }
}
