import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributionsService } from './distributions.service';
import { DistributionsController } from './distributions.controller';
import { Distribution } from './entities/distribution.entity';
import { PickupToken } from './entities/pickup-token.entity';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Distribution, PickupToken]),
    forwardRef(() => OrdersModule)
  ],
  controllers: [DistributionsController],
  providers: [DistributionsService],
  exports: [DistributionsService]
})
export class DistributionsModule {}
