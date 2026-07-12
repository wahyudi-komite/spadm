import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { BazaarEvent } from './entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BazaarEvent])],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
