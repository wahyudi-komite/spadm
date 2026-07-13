import { Injectable, Logger } from '@nestjs/common';
import { WhatsAppProvider, WhatsAppConnectionStatus } from './whatsapp-provider.interface';

@Injectable()
export class MockWhatsAppProvider implements WhatsAppProvider {
  readonly name = 'mock';
  private readonly logger = new Logger(MockWhatsAppProvider.name);

  async sendText(phone: string, message: string): Promise<string> {
    this.logger.log(`[MOCK] WhatsApp to ${phone}: ${message.substring(0, 50)}...`);
    return `mock-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  async connect(): Promise<void> {}

  getStatus(): WhatsAppConnectionStatus {
    return {
      provider: this.name,
      state: 'CONNECTED',
      qrCode: null,
      lastConnectedAt: new Date(),
      lastError: null,
    };
  }
}
