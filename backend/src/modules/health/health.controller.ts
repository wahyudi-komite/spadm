import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { WHATSAPP_PROVIDER } from '../notifications/providers/whatsapp-provider.interface';
import type { WhatsAppProvider } from '../notifications/providers/whatsapp-provider.interface';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private dataSource: DataSource,
    private config: ConfigService,
    @Inject(WHATSAPP_PROVIDER) private whatsapp: WhatsAppProvider,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check API health status' })
  async check() {
    const dbStatus = await this.checkDatabase();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus ? 'connected' : 'disconnected',
      payment: this.config.get<string>('PAYMENT_PROVIDER') ? 'configured' : 'not_configured',
      whatsapp: this.whatsapp.getStatus().state,
      storage: this.config.get<string>('STORAGE_PATH') ? 'configured' : 'not_configured',
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
