import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationQueueService } from './notification-queue.service';
import {
  DeliveryStatus,
  NotificationDelivery,
} from './entities/notification-delivery.entity';
import { WHATSAPP_PROVIDER } from './providers/whatsapp-provider.interface';
import type { WhatsAppProvider } from './providers/whatsapp-provider.interface';

describe('NotificationQueueService', () => {
  let queueService: NotificationQueueService;
  let deliveryRepo: jest.Mocked<Repository<NotificationDelivery>>;
  let whatsappProvider: jest.Mocked<WhatsAppProvider>;

  const mockDelivery = {
    id: 1,
    notificationId: 1,
    channel: 'WHATSAPP',
    recipient: '628123456789',
    template: 'TEST',
    payload: { message: 'Hello' },
    status: DeliveryStatus.PENDING,
    attempts: 0,
    nextAttemptAt: null,
    lastError: null,
    providerMessageId: null,
    sentAt: null,
    deliveredAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as NotificationDelivery;

  beforeEach(async () => {
    const mockProvider: jest.Mocked<WhatsAppProvider> = {
      name: 'mock',
      sendText: jest.fn(),
      getStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationQueueService,
        {
          provide: getRepositoryToken(NotificationDelivery),
          useValue: {
            find: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: WHATSAPP_PROVIDER,
          useValue: mockProvider,
        },
      ],
    }).compile();

    queueService = module.get(NotificationQueueService);
    deliveryRepo = module.get(getRepositoryToken(NotificationDelivery));
    whatsappProvider = module.get(WHATSAPP_PROVIDER);
  });

  it('should be defined', () => {
    expect(queueService).toBeDefined();
  });

  describe('processQueue', () => {
    it('should process pending deliveries', async () => {
      deliveryRepo.find.mockResolvedValue([mockDelivery]);
      deliveryRepo.update
        .mockResolvedValueOnce({ affected: 0, raw: [] } as any)
        .mockResolvedValueOnce({ affected: 1, raw: [] } as any)
        .mockResolvedValueOnce({ affected: 1, raw: [] } as any);
      whatsappProvider.sendText.mockResolvedValue('msg-123');

      await queueService.processQueue();

      expect(whatsappProvider.sendText).toHaveBeenCalledWith(
        '628123456789',
        'Hello',
      );
      expect(deliveryRepo.update).toHaveBeenCalledWith(1, {
        status: DeliveryStatus.SENT,
        providerMessageId: 'msg-123',
        sentAt: expect.any(Date),
        lastError: null,
      });
    });

    it('should handle send failure with retry', async () => {
      deliveryRepo.find.mockResolvedValue([mockDelivery]);
      deliveryRepo.update
        .mockResolvedValueOnce({ affected: 0, raw: [] } as any)
        .mockResolvedValueOnce({ affected: 1, raw: [] } as any)
        .mockResolvedValueOnce({ affected: 1, raw: [] } as any);
      whatsappProvider.sendText.mockRejectedValue(new Error('Network error'));

      await queueService.processQueue();

      expect(deliveryRepo.update).toHaveBeenCalledWith(1, {
        status: DeliveryStatus.RETRY,
        lastError: 'Network error',
        nextAttemptAt: expect.any(Date),
      });
    });

    it('should mark as failed after max retries', async () => {
      const retryDelivery = {
        ...mockDelivery,
        attempts: 5,
        status: DeliveryStatus.RETRY,
      } as NotificationDelivery;
      deliveryRepo.find.mockResolvedValue([retryDelivery]);
      deliveryRepo.update
        .mockResolvedValueOnce({ affected: 0, raw: [] } as any)
        .mockResolvedValueOnce({ affected: 1, raw: [] } as any)
        .mockResolvedValueOnce({ affected: 1, raw: [] } as any);
      whatsappProvider.sendText.mockRejectedValue(new Error('Final error'));

      await queueService.processQueue();

      expect(deliveryRepo.update).toHaveBeenCalledWith(1, {
        status: DeliveryStatus.FAILED,
        lastError: 'Final error',
        nextAttemptAt: null,
      });
    });

    it('should not process when already processing', async () => {
      (queueService as unknown as { processing: boolean }).processing = true;

      await queueService.processQueue();

      expect(deliveryRepo.find).not.toHaveBeenCalled();
    });

    it('should skip delivery claimed by another instance', async () => {
      deliveryRepo.find.mockResolvedValue([mockDelivery]);
      deliveryRepo.update
        .mockResolvedValueOnce({ affected: 0, raw: [] } as any)
        .mockResolvedValueOnce({ affected: 0, raw: [] } as any);

      await queueService.processQueue();

      expect(whatsappProvider.sendText).not.toHaveBeenCalled();
    });

    it('should recover stale processing deliveries before polling', async () => {
      deliveryRepo.update.mockResolvedValueOnce({
        affected: 2,
        raw: [],
      } as any);
      deliveryRepo.find.mockResolvedValue([]);

      await queueService.processQueue();

      expect(deliveryRepo.update).toHaveBeenCalledWith(
        {
          status: DeliveryStatus.PROCESSING,
          updatedAt: expect.anything(),
        },
        {
          status: DeliveryStatus.RETRY,
          nextAttemptAt: expect.any(Date),
          lastError:
            'Proses pengiriman terhenti dan dijadwalkan ulang otomatis',
        },
      );
    });
  });
});
