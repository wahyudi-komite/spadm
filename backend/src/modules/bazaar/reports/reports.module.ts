import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../../payments/entities/payment.entity';
import { PickupToken } from '../distributions/entities/pickup-token.entity';
import { BazaarOrder } from '../orders/entities/order.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([BazaarOrder, Payment, PickupToken])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
