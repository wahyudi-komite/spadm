import { Test, TestingModule } from '@nestjs/testing';
import { MockWhatsAppProvider } from './mock-whatsapp.provider';

describe('MockWhatsAppProvider', () => {
  let provider: MockWhatsAppProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockWhatsAppProvider],
    }).compile();

    provider = module.get(MockWhatsAppProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should have name "mock"', () => {
    expect(provider.name).toBe('mock');
  });

  describe('sendText', () => {
    it('should return a mock message ID', async () => {
      const result = await provider.sendText('628123456789', 'Hello');

      expect(result).toMatch(/^mock-\d+-[a-z0-9]+$/);
    });
  });

  describe('getStatus', () => {
    it('should always return CONNECTED', () => {
      const status = provider.getStatus();

      expect(status.state).toBe('CONNECTED');
      expect(status.provider).toBe('mock');
    });
  });
});
