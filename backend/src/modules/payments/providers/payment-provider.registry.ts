import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MockQrisProvider } from './mock-qris.provider';
import { PaymentGatewayProvider } from './payment-gateway.provider';

@Injectable()
export class PaymentProviderRegistry {
  constructor(
    private readonly configService: ConfigService,
    private readonly mockProvider: MockQrisProvider,
  ) {}

  get(name?: string): PaymentGatewayProvider {
    const providerName = (name || this.configService.get<string>('PAYMENT_PROVIDER') || '')
      .trim()
      .toLowerCase();

    if (providerName === 'mock') {
      if (this.configService.get<string>('app.nodeEnv') !== 'development') {
        throw new BadRequestException('Mock payment provider hanya boleh dipakai pada development');
      }
      return this.mockProvider;
    }

    throw new BadRequestException(
      'Payment provider belum dikonfigurasi. Tentukan adapter QRIS yang akan digunakan.',
    );
  }
}
