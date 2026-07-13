import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { BazaarOrder } from './entities/order.entity';
import { BazaarOrderItem } from './entities/order-item.entity';
import { BazaarOrderStatusHistory } from './entities/order-status-history.entity';
import { BazaarProduct } from '../products/entities/product.entity';
import { BazaarEvent } from '../events/entities/event.entity';
import { BazaarBatch } from '../batches/entities/batch.entity';
import { OrganizationalUnitAreaMapping } from '../distributions/entities/ou-area-mapping.entity';
import { DistributionArea } from '../distributions/entities/distribution-area.entity';
import { Member } from '../../members/entities/member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BazaarOrder,
      BazaarOrderItem,
      BazaarOrderStatusHistory,
      BazaarProduct,
      BazaarEvent,
      BazaarBatch,
      OrganizationalUnitAreaMapping,
      DistributionArea,
      Member
    ])
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule {}
