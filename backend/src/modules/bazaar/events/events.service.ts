import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BazaarEvent } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(BazaarEvent)
    private readonly eventRepo: Repository<BazaarEvent>,
  ) {}

  create(createEventDto: CreateEventDto) {
    const event = this.eventRepo.create(createEventDto);
    return this.eventRepo.save(event);
  }

  findAll() {
    return this.eventRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    const event = await this.findOne(id);
    Object.assign(event, updateEventDto);
    return this.eventRepo.save(event);
  }

  async remove(id: number) {
    const event = await this.findOne(id);
    return this.eventRepo.softRemove(event);
  }
}
