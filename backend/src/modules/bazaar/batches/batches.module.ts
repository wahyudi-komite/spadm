import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchesService } from './batches.service';
import { BatchesController } from './batches.controller';
import { BazaarBatch } from './entities/batch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BazaarBatch])],
  controllers: [BatchesController],
  providers: [BatchesService],
})
export class BatchesModule {}
