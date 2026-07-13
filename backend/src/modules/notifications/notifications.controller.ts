import { Controller, Get, Post, Patch, Param, Query, UseGuards, ParseIntPipe, ValidationPipe, Inject } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard, PermissionsGuard } from '../../common/guards';
import { CurrentUser, Permissions } from '../../common/decorators';
import { PaginationQueryDto } from './dto';
import { WHATSAPP_PROVIDER } from './providers/whatsapp-provider.interface';
import type { WhatsAppProvider } from './providers/whatsapp-provider.interface';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notifService: NotificationsService,
    @Inject(WHATSAPP_PROVIDER) private readonly whatsappProvider: WhatsAppProvider,
  ) {}

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('settings.manage')
  @Get('whatsapp/status')
  getWhatsAppStatus() {
    return this.whatsappProvider.getStatus();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('settings.manage')
  @Post('whatsapp/connect')
  async connectWhatsApp() {
    if (this.whatsappProvider.connect) {
      await this.whatsappProvider.connect();
    }
    return this.whatsappProvider.getStatus();
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findMine(
    @CurrentUser() userId: number,
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: PaginationQueryDto,
  ) {
    return this.notifService.findMine(userId, query.page, query.limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  unreadCount(@CurrentUser() userId: number) {
    return this.notifService.unreadCount(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  markRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.notifService.markRead(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read-all')
  markAllRead(@CurrentUser() userId: number) {
    return this.notifService.markAllRead(userId);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('settings.manage')
  @Get('deliveries')
  listDeliveries(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: PaginationQueryDto,
  ) {
    return this.notifService.listDeliveries(query.page || 1, query.limit || 50);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('settings.manage')
  @Post('deliveries/:id/retry')
  retryDelivery(@Param('id', ParseIntPipe) id: number) {
    return this.notifService.retryDelivery(id);
  }
}
