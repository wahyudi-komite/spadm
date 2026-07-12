import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { PaymentStatusHistory } from './entities/payment-status-history.entity';
import { OrdersModule } from '../bazaar/orders/orders.module';
import { DistributionsModule } from '../bazaar/distributions/distributions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, PaymentStatusHistory]),
    OrdersModule,
    DistributionsModule // To generate pickup tokens on success
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService]
})
export class PaymentsModule {}
