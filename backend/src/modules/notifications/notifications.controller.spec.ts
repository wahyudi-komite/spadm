import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationType } from './entities/notification.entity';
import { PaginationQueryDto } from './dto';
import { WHATSAPP_PROVIDER } from './providers/whatsapp-provider.interface';
import { JwtAuthGuard, PermissionsGuard } from '../../common/guards';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: jest.Mocked<NotificationsService>;
  let whatsappProvider: { getStatus: jest.Mock };

  const mockNotification = {
    id: 1, userId: 1, type: NotificationType.PAYMENT_SUCCESS,
    title: 'Test', message: 'Test message', deepLink: null,
    metadata: null, isRead: false, readAt: null,
    createdAt: new Date(), updatedAt: new Date(),
  } as Notification;

  beforeEach(async () => {
    const mockService = {
      findMine: jest.fn(),
      unreadCount: jest.fn(),
      markRead: jest.fn(),
      markAllRead: jest.fn(),
      listDeliveries: jest.fn(),
      deliverySummary: jest.fn(),
      retryDelivery: jest.fn(),
    };
    const mockWhatsAppProvider = { getStatus: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockService },
        { provide: WHATSAPP_PROVIDER, useValue: mockWhatsAppProvider },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(NotificationsController);
    service = module.get(NotificationsService);
    whatsappProvider = module.get(WHATSAPP_PROVIDER);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findMine', () => {
    it('should return paginated notifications for current user', async () => {
      const result = { data: [mockNotification], meta: { total: 1, page: 1, limit: 20, totalPages: 1 } };
      service.findMine.mockResolvedValue(result);
      const query: PaginationQueryDto = { page: 1, limit: 20 };

      const response = await controller.findMine(1, query);

      expect(response).toEqual(result);
      expect(service.findMine).toHaveBeenCalledWith(1, 1, 20);
    });
  });

  describe('unreadCount', () => {
    it('should return unread count', async () => {
      service.unreadCount.mockResolvedValue({ count: 3 });

      const response = await controller.unreadCount(1);

      expect(response).toEqual({ count: 3 });
      expect(service.unreadCount).toHaveBeenCalledWith(1);
    });
  });

  describe('markRead', () => {
    it('should mark notification as read', async () => {
      service.markRead.mockResolvedValue(mockNotification);

      const response = await controller.markRead(1, 1);

      expect(response).toEqual(mockNotification);
      expect(service.markRead).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('markAllRead', () => {
    it('should mark all notifications as read', async () => {
      service.markAllRead.mockResolvedValue({ updated: 5 });

      const response = await controller.markAllRead(1);

      expect(response).toEqual({ updated: 5 });
      expect(service.markAllRead).toHaveBeenCalledWith(1);
    });
  });

  describe('listDeliveries', () => {
    it('should return paginated deliveries', async () => {
      const result = { data: [], meta: { total: 0, page: 1, limit: 50 } };
      service.listDeliveries.mockResolvedValue(result);
      const query: PaginationQueryDto = { page: 1, limit: 50 };

      const response = await controller.listDeliveries(query);

      expect(response).toEqual(result);
      expect(service.listDeliveries).toHaveBeenCalledWith(1, 50);
    });
  });

  describe('retryDelivery', () => {
    it('should retry delivery', async () => {
      const delivery = { id: 1, status: 'RETRY' } as any;
      service.retryDelivery.mockResolvedValue(delivery);

      const response = await controller.retryDelivery(1);

      expect(response).toEqual(delivery);
      expect(service.retryDelivery).toHaveBeenCalledWith(1);
    });
  });

  describe('deliverySummary', () => {
    it('should return provider and delivery status', async () => {
      const deliveries = { total: 3, pendingWork: 1, byStatus: {} as any };
      whatsappProvider.getStatus.mockReturnValue({ connected: true });
      service.deliverySummary.mockResolvedValue(deliveries);

      const response = await controller.deliverySummary();

      expect(response).toEqual({ whatsapp: { connected: true }, deliveries });
    });
  });
});
