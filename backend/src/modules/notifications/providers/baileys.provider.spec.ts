import { ConfigService } from '@nestjs/config';
import { BaileysProvider } from './baileys.provider';

describe('BaileysProvider', () => {
  let provider: BaileysProvider;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    } as any;

    configService.get.mockImplementation((key: string, defaultValue?: string) => {
      const map: Record<string, string | undefined> = {
        WHATSAPP_QUEUE_ENABLED: 'false',
        WHATSAPP_PROVIDER: 'mock',
        WHATSAPP_SESSION_PATH: './storage/whatsapp',
      };
      return map[key] ?? defaultValue;
    });

    provider = new BaileysProvider(configService);
  });

  it('should be DISABLED when config says so', () => {
    const status = provider.getStatus();
    expect(status.state).toBe('DISABLED');
  });

  it('should return status copy (immutable)', () => {
    const status1 = provider.getStatus();
    const status2 = provider.getStatus();
    expect(status1).toEqual(status2);
    expect(status1).not.toBe(status2);
  });

  describe('when enabled', () => {
    beforeEach(() => {
      configService.get.mockImplementation((key: string, defaultValue?: string) => {
        const map: Record<string, string | undefined> = {
          WHATSAPP_QUEUE_ENABLED: 'true',
          WHATSAPP_PROVIDER: 'baileys',
          WHATSAPP_SESSION_PATH: './storage/whatsapp',
        };
        return map[key] ?? defaultValue;
      });
      provider = new BaileysProvider(configService);
    });

    it('should be DISCONNECTED initially', () => {
      const status = provider.getStatus();
      expect(status.state).toBe('DISCONNECTED');
    });

    it('should reject sendText when not connected', async () => {
      jest.spyOn(provider, 'connect').mockResolvedValue();
      await expect(provider.sendText('628123456789', 'Hello'))
        .rejects.toThrow('WhatsApp belum terhubung');
    });

    it('should reject invalid phone numbers', async () => {
      (provider as any).socket = {} as any;
      (provider as any).status.state = 'CONNECTED';

      await expect(provider.sendText('123', 'Hello'))
        .rejects.toThrow('Nomor WhatsApp tidak valid');
    });

    it('should clean up on module destroy', () => {
      const end = jest.fn();
      (provider as any).socket = { end } as any;

      provider.onModuleDestroy();

      expect(end).toHaveBeenCalled();
    });
  });
});
