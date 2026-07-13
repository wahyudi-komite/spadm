import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { PaymentStatusHistory } from './entities/payment-status-history.entity';
import { PaymentWebhookLog } from './entities/payment-webhook-log.entity';
import { ManualPaymentVerification } from './entities/manual-payment-verification.entity';
import { OrdersModule } from '../bazaar/orders/orders.module';
import { DistributionsModule } from '../bazaar/distributions/distributions.module';
import { PaymentProviderRegistry } from './providers/payment-provider.registry';
import { MockQrisProvider } from './providers/mock-qris.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, PaymentStatusHistory, PaymentWebhookLog, ManualPaymentVerification]),
    OrdersModule,
    DistributionsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentProviderRegistry, MockQrisProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
