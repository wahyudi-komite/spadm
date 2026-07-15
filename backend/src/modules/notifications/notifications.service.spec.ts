import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationType } from './entities/notification.entity';
import {
  DeliveryStatus,
  NotificationDelivery,
} from './entities/notification-delivery.entity';
import { BazaarOrder } from '../bazaar/orders/entities/order.entity';
import { NotificationsGateway } from './notifications.gateway';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notifRepo: jest.Mocked<Repository<Notification>>;
  let deliveryRepo: jest.Mocked<Repository<NotificationDelivery>>;
  let orderRepo: jest.Mocked<Repository<BazaarOrder>>;
  let gateway: jest.Mocked<NotificationsGateway>;

  const mockNotification = {
    id: 1,
    userId: 1,
    type: NotificationType.PAYMENT_SUCCESS,
    title: 'Test',
    message: 'Test',
    deepLink: null,
    metadata: null,
    isRead: false,
    readAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Notification;

  beforeEach(async () => {
    const mockManager = {
      save: jest.fn(),
      transaction: jest.fn((cb: (m: any) => Promise<any>) => cb(mockManager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: NotificationsGateway,
          useValue: {
            sendNotification: jest.fn(),
            sendUnreadCount: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Notification),
          useValue: {
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            count: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            manager: mockManager,
          },
        },
        {
          provide: getRepositoryToken(NotificationDelivery),
          useValue: {
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            count: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BazaarOrder),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(NotificationsService);
    notifRepo = module.get(getRepositoryToken(Notification));
    deliveryRepo = module.get(getRepositoryToken(NotificationDelivery));
    orderRepo = module.get(getRepositoryToken(BazaarOrder));
    gateway = module.get(NotificationsGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create notification and delivery when whatsapp is provided', async () => {
      const input = {
        userId: 1,
        type: NotificationType.PAYMENT_SUCCESS,
        title: 'Test',
        message: 'Test message',
        whatsapp: {
          phone: '628123456789',
          template: 'TEST',
          message: 'WA message',
        },
      };

      notifRepo.manager.save
        .mockResolvedValueOnce(mockNotification)
        .mockResolvedValueOnce({ id: 1 } as NotificationDelivery);

      const result = await service.create(input);

      expect(result).toEqual(mockNotification);
      expect(notifRepo.manager.save).toHaveBeenCalledTimes(2);
    });

    it('should create notification without delivery when no whatsapp', async () => {
      const input = {
        userId: 1,
        type: NotificationType.SYSTEM_ANNOUNCEMENT,
        title: 'Test',
        message: 'Test message',
      };

      notifRepo.manager.save.mockResolvedValue(mockNotification);

      const result = await service.create(input);

      expect(result).toEqual(mockNotification);
      expect(notifRepo.manager.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('findMine', () => {
    it('should return paginated notifications for user', async () => {
      notifRepo.findAndCount.mockResolvedValue([[mockNotification], 1]);

      const result = await service.findMine(1, 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('unreadCount', () => {
    it('should return count of unread notifications', async () => {
      notifRepo.count.mockResolvedValue(3);

      const result = await service.unreadCount(1);

      expect(result.count).toBe(3);
    });
  });

  describe('markRead', () => {
    it('should mark notification as read', async () => {
      const unread = { ...mockNotification, isRead: false };
      notifRepo.findOne.mockResolvedValue(unread);
      notifRepo.save.mockResolvedValue({
        ...unread,
        isRead: true,
        readAt: new Date(),
      });

      const result = await service.markRead(1, 1);

      expect(result.isRead).toBe(true);
      expect(result.readAt).toBeDefined();
    });

    it('should throw when notification not found', async () => {
      notifRepo.findOne.mockResolvedValue(null);

      await expect(service.markRead(999, 1)).rejects.toThrow(
        'Notifikasi tidak ditemukan',
      );
    });
  });

  describe('markAllRead', () => {
    it('should mark all notifications as read', async () => {
      notifRepo.update.mockResolvedValue({ affected: 5, raw: [] } as any);

      const result = await service.markAllRead(1);

      expect(result.updated).toBe(5);
    });
  });

  describe('retryDelivery', () => {
    it('should set delivery status to RETRY', async () => {
      const delivery = {
        id: 1,
        status: DeliveryStatus.RETRY,
        attempts: 0,
      } as NotificationDelivery;
      deliveryRepo.update.mockResolvedValue({ affected: 1, raw: [] } as any);
      deliveryRepo.findOne.mockResolvedValue(delivery);

      const result = await service.retryDelivery(1);

      expect(result?.status).toBe(DeliveryStatus.RETRY);
      expect(deliveryRepo.update).toHaveBeenCalledWith(
        { id: 1, status: DeliveryStatus.FAILED },
        {
          status: DeliveryStatus.RETRY,
          attempts: 0,
          nextAttemptAt: expect.any(Date),
          lastError: null,
        },
      );
    });

    it('should throw when delivery not found', async () => {
      deliveryRepo.update.mockResolvedValue({ affected: 0, raw: [] } as any);
      deliveryRepo.findOne.mockResolvedValue(null);

      await expect(service.retryDelivery(999)).rejects.toThrow(
        'Histori pengiriman tidak ditemukan',
      );
    });

    it('should reject retry while a delivery is not failed', async () => {
      deliveryRepo.update.mockResolvedValue({ affected: 0, raw: [] } as any);
      deliveryRepo.findOne.mockResolvedValue({
        id: 1,
        status: DeliveryStatus.PROCESSING,
      } as NotificationDelivery);

      await expect(service.retryDelivery(1)).rejects.toThrow(
        'Hanya pengiriman berstatus gagal yang dapat diulang',
      );
    });
  });

  describe('deliverySummary', () => {
    it('should aggregate delivery status counts', async () => {
      deliveryRepo.count
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(6);

      const result = await service.deliverySummary();

      expect(result.total).toBe(21);
      expect(result.pendingWork).toBe(6);
      expect(result.byStatus[DeliveryStatus.FAILED]).toBe(6);
    });
  });
});
