import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
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

  @Get('live')
  @ApiOperation({ summary: 'Check whether the API process is alive' })
  live() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get(['', 'ready'])
  @ApiOperation({
    summary: 'Check whether the API is ready to receive traffic',
  })
  async ready() {
    const dbStatus = await this.checkDatabase();

    const result = {
      status: dbStatus ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      database: dbStatus ? 'connected' : 'disconnected',
      payment: this.config.get<string>('PAYMENT_PROVIDER')
        ? 'configured'
        : 'not_configured',
      whatsapp: this.whatsapp.getStatus().state,
      storage: this.config.get<string>('STORAGE_PATH')
        ? 'configured'
        : 'not_configured',
    };
    if (!dbStatus) {
      throw new ServiceUnavailableException(result);
    }
    return result;
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
