import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { HealthController } from './health.controller';
import type { WhatsAppProvider } from '../notifications/providers/whatsapp-provider.interface';

describe('HealthController', () => {
  const config = {
    get: jest.fn((key: string) =>
      key === 'PAYMENT_PROVIDER' ? 'mock' : undefined,
    ),
  } as unknown as ConfigService;
  const whatsapp = {
    name: 'mock',
    sendText: jest.fn(),
    getStatus: jest.fn(() => ({
      provider: 'mock',
      state: 'CONNECTED' as const,
      qrCode: null,
      lastConnectedAt: null,
      lastError: null,
    })),
  } as WhatsAppProvider;

  it('reports liveness without checking dependencies', () => {
    const query = jest.fn();
    const dataSource = { query } as unknown as DataSource;
    const controller = new HealthController(dataSource, config, whatsapp);

    expect(controller.live().status).toBe('ok');
    expect(query).not.toHaveBeenCalled();
  });

  it('reports ready when the database responds', async () => {
    const dataSource = {
      query: jest.fn().mockResolvedValue([{ ok: 1 }]),
    } as unknown as DataSource;
    const controller = new HealthController(dataSource, config, whatsapp);

    await expect(controller.ready()).resolves.toMatchObject({
      status: 'ready',
      database: 'connected',
    });
  });

  it('returns service unavailable when the database is down', async () => {
    const dataSource = {
      query: jest.fn().mockRejectedValue(new Error('connection refused')),
    } as unknown as DataSource;
    const controller = new HealthController(dataSource, config, whatsapp);

    await expect(controller.ready()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
