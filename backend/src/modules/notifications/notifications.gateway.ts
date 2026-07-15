import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { isAllowedOrigin } from '../../config';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    credentials: true,
    origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<number, Set<string>>();

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    const authToken: unknown = client.handshake.auth?.token;
    const authorization = client.handshake.headers.authorization;
    const token =
      typeof authToken === 'string'
        ? authToken
        : typeof authorization === 'string'
          ? authorization.replace(/^Bearer\s+/i, '')
          : null;

    try {
      if (!token) throw new Error('Missing access token');
      const payload = await this.jwtService.verifyAsync<{ sub: number }>(token);
      const userId = Number(payload.sub);
      if (!Number.isInteger(userId) || userId <= 0) {
        throw new Error('Invalid access token');
      }

      if (!this.userSockets.has(userId))
        this.userSockets.set(userId, new Set());
      this.userSockets.get(userId)!.add(client.id);
      await client.join(`user-${userId}`);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.delete(client.id) && sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  sendNotification(userId: number, notification: any) {
    this.server.to(`user-${userId}`).emit('notification', notification);
  }

  sendUnreadCount(userId: number, count: number) {
    this.server.to(`user-${userId}`).emit('unread_count', count);
  }
}
