import { Module, Global } from '@nestjs/common';
import { QRIS_PROVIDER } from './qris-provider.interface';
import { MockQrisProvider } from './mock-qris.provider';

@Global()
@Module({
  providers: [
    {
      provide: QRIS_PROVIDER,
      useClass: MockQrisProvider,
    },
  ],
  exports: [QRIS_PROVIDER],
})
export class ProviderModule {}
