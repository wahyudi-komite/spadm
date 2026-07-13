import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  WhatsAppConnectionStatus,
  WhatsAppProvider,
} from './whatsapp-provider.interface';

interface BaileysSocket {
  ev: {
    on(event: string, listener: (value: unknown) => void): void;
  };
  sendMessage(
    jid: string,
    content: { text: string },
  ): Promise<{ key?: { id?: string | null } }>;
  end(error?: Error): void;
}

@Injectable()
export class BaileysProvider implements WhatsAppProvider, OnModuleInit, OnModuleDestroy {
  readonly name = 'baileys';
  private readonly logger = new Logger(BaileysProvider.name);
  private socket: BaileysSocket | null = null;
  private saveCredentials: (() => Promise<void>) | null = null;
  private connecting: Promise<void> | null = null;
  private status: WhatsAppConnectionStatus = {
    provider: this.name,
    state: 'DISCONNECTED',
    qrCode: null,
    lastConnectedAt: null,
    lastError: null,
  };

  constructor(private readonly config: ConfigService) {
    if (!this.enabled) this.status.state = 'DISABLED';
  }

  async onModuleInit() {
    try {
      await this.connect();
    } catch (error) {
      this.logger.error(`Initial connection error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async connect(): Promise<void> {
    if (!this.enabled || this.socket || this.connecting) {
      return this.connecting ?? Promise.resolve();
    }
    this.connecting = this.createSocket();
    try {
      await this.connecting;
    } finally {
      this.connecting = null;
    }
  }

  async sendText(phone: string, message: string): Promise<string> {
    await this.connect();
    if (!this.socket || this.status.state !== 'CONNECTED') {
      throw new Error('WhatsApp belum terhubung');
    }
    const normalizedPhone = phone.replace(/\D/g, '').replace(/^0/, '62');
    if (!/^62\d{8,14}$/.test(normalizedPhone)) {
      throw new Error('Nomor WhatsApp tidak valid');
    }
    const result = await this.socket.sendMessage(
      `${normalizedPhone}@s.whatsapp.net`,
      { text: message },
    );
    return result.key?.id || `baileys-${Date.now()}`;
  }

  getStatus(): WhatsAppConnectionStatus {
    return { ...this.status };
  }

  onModuleDestroy(): void {
    this.socket?.end(new Error('Application shutdown'));
  }

  private get enabled(): boolean {
    return (
      this.config.get<string>('WHATSAPP_QUEUE_ENABLED', 'true') === 'true' &&
      this.config.get<string>('WHATSAPP_PROVIDER', 'baileys') === 'baileys'
    );
  }

  private async createSocket(): Promise<void> {
    this.status = { ...this.status, state: 'CONNECTING', lastError: null };
    try {
      const baileys = await import('@whiskeysockets/baileys');
      const sessionPath = this.config.get<string>(
        'WHATSAPP_SESSION_PATH',
        './storage/whatsapp',
      );
      const auth = await baileys.useMultiFileAuthState(sessionPath);
      this.saveCredentials = auth.saveCreds;
      const socket = baileys.default({
        auth: auth.state,
        printQRInTerminal: true,
        markOnlineOnConnect: false,
        syncFullHistory: false,
      }) as unknown as BaileysSocket;
      this.socket = socket;
      socket.ev.on('creds.update', () => {
        void this.saveCredentials?.();
      });
      socket.ev.on('connection.update', (rawUpdate: unknown) => {
        const update = rawUpdate as {
          connection?: string;
          qr?: string;
          lastDisconnect?: { error?: unknown };
        };
        if (update.qr) {
          this.status = { ...this.status, state: 'QR_REQUIRED', qrCode: update.qr };
        }
        if (update.connection === 'open') {
          this.status = {
            ...this.status,
            state: 'CONNECTED',
            qrCode: null,
            lastConnectedAt: new Date(),
            lastError: null,
          };
        }
        if (update.connection === 'close') {
          this.socket = null;
          this.status = {
            ...this.status,
            state: 'DISCONNECTED',
            lastError: 'Koneksi WhatsApp terputus',
          };
          setTimeout(() => void this.connect(), 5000);
        }
      });
    } catch (error) {
      this.socket = null;
      this.status = {
        ...this.status,
        state: 'DISCONNECTED',
        lastError: error instanceof Error ? error.message : String(error),
      };
      this.logger.error(`Gagal menghubungkan Baileys: ${this.status.lastError}`);
      throw error;
    }
  }
}
