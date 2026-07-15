import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateway } from './notifications.gateway';
import { JwtService } from '@nestjs/jwt';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let jwtService: { verifyAsync: jest.Mock };

  beforeEach(async () => {
    jwtService = { verifyAsync: jest.fn().mockResolvedValue({ sub: 1 }) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsGateway,
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    gateway = module.get(NotificationsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should join the authenticated user room', async () => {
      const client = {
        handshake: { auth: { token: 'valid-token' }, headers: {} },
        id: 'socket-1',
        join: jest.fn(),
        disconnect: jest.fn(),
      } as any;

      await gateway.handleConnection(client);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
      expect(client.join).toHaveBeenCalledWith('user-1');
    });

    it('should disconnect when token is missing', async () => {
      const client = {
        handshake: { auth: {}, headers: {} },
        id: 'socket-1',
        join: jest.fn(),
        disconnect: jest.fn(),
      } as any;

      await gateway.handleConnection(client);

      expect(client.join).not.toHaveBeenCalled();
      expect(client.disconnect).toHaveBeenCalledWith(true);
    });
  });

  describe('handleDisconnect', () => {
    it('should remove socket from tracking', async () => {
      const client = { id: 'socket-1' } as any;

      await gateway.handleConnection({
        handshake: { auth: { token: 'valid-token' }, headers: {} },
        id: 'socket-1',
        join: jest.fn(),
        disconnect: jest.fn(),
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
