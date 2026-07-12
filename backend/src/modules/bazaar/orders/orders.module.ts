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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BazaarOrder,
      BazaarOrderItem,
      BazaarOrderStatusHistory,
      BazaarProduct,
      BazaarEvent,
      BazaarBatch
    ])
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule {}
