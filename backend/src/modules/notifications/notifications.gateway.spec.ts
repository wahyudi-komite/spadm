import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './notifications.gateway';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsGateway],
    }).compile();

    gateway = module.get(NotificationsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should join user room when userId is provided', () => {
      const client = {
        handshake: { query: { userId: '1' } },
        id: 'socket-1',
        join: jest.fn(),
      } as any;

      gateway.handleConnection(client);

      expect(client.join).toHaveBeenCalledWith('user-1');
    });

    it('should not join when userId is missing', () => {
      const client = {
        handshake: { query: {} },
        id: 'socket-1',
        join: jest.fn(),
      } as any;

      gateway.handleConnection(client);

      expect(client.join).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should remove socket from tracking', () => {
      const client = { id: 'socket-1' } as any;

      gateway.handleConnection({
        handshake: { query: { userId: '1' } },
        id: 'socket-1',
        join: jest.fn(),
      } as any);

      gateway.handleDisconnect(client);
    });
  });

  describe('sendNotification', () => {
    it('should emit notification to user room', () => {
      const server = { to: jest.fn().mockReturnThis(), emit: jest.fn() } as any;
      gateway.server = server;

      gateway.sendNotification(1, { id: 1, title: 'Test' });

      expect(server.to).toHaveBeenCalledWith('user-1');
      expect(server.emit).toHaveBeenCalledWith('notification', { id: 1, title: 'Test' });
    });
  });

  describe('sendUnreadCount', () => {
    it('should emit unread count to user room', () => {
      const server = { to: jest.fn().mockReturnThis(), emit: jest.fn() } as any;
      gateway.server = server;

      gateway.sendUnreadCount(1, 5);

      expect(server.to).toHaveBeenCalledWith('user-1');
      expect(server.emit).toHaveBeenCalledWith('unread_count', 5);
    });
  });
});
