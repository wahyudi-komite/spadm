import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '../../common/guards';
import { Permissions } from '../../common/decorators';
import { WHATSAPP_PROVIDER } from './providers/whatsapp-provider.interface';
import type { WhatsAppProvider, WhatsAppConnectionStatus } from './providers/whatsapp-provider.interface';

@Controller('admin/whatsapp')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WhatsAppAdminController {
  constructor(
    @Inject(WHATSAPP_PROVIDER)
    private readonly whatsappProvider: WhatsAppProvider,
  ) {}

  @Get('status')
  @Permissions('admin.whatsapp.manage')
  getStatus(): WhatsAppConnectionStatus {
    return this.whatsappProvider.getStatus();
  }

  @Post('connect')
  @Permissions('admin.whatsapp.manage')
  async connect(): Promise<{ message: string }> {
    if ('connect' in this.whatsappProvider && typeof (this.whatsappProvider as any).connect === 'function') {
      await (this.whatsappProvider as any).connect();
      return { message: 'WhatsApp connecting...' };
    }
    return { message: 'WhatsApp provider does not support manual connect' };
  }

  @Post('disconnect')
  @Permissions('admin.whatsapp.manage')
  async disconnect(): Promise<{ message: string }> {
    if ('onModuleDestroy' in this.whatsappProvider && typeof (this.whatsappProvider as any).onModuleDestroy === 'function') {
      (this.whatsappProvider as any).onModuleDestroy();
    }
    return { message: 'WhatsApp disconnected' };
  }
}
