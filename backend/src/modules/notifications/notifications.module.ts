import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { BazaarOrder } from '../bazaar/orders/entities/order.entity';
import { NotificationDelivery } from './entities/notification-delivery.entity';
import { Notification } from './entities/notification.entity';
import { NotificationQueueService } from './notification-queue.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { BaileysProvider } from './providers/baileys.provider';
import { MockWhatsAppProvider } from './providers/mock-whatsapp.provider';
import { WHATSAPP_PROVIDER } from './providers/whatsapp-provider.interface';
import { NotificationsGateway } from './notifications.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Notification, NotificationDelivery, BazaarOrder])],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    NotificationQueueService,
    BaileysProvider,
    MockWhatsAppProvider,
    {
      provide: WHATSAPP_PROVIDER,
      useFactory: (config: ConfigService, baileys: BaileysProvider, mock: MockWhatsAppProvider) => {
        const provider = (config.get<string>('WHATSAPP_PROVIDER') || 'baileys')
          .trim()
          .toLowerCase();
        return provider === 'mock' ? mock : baileys;
      },
      inject: [ConfigService, BaileysProvider, MockWhatsAppProvider],
    },
  ],
  exports: [NotificationsService, WHATSAPP_PROVIDER, NotificationsGateway],
})
export class NotificationsModule {}
