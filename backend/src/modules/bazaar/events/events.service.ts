import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { AuditLogService } from '../../audit-logs/audit-log.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { BazaarEvent } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(BazaarEvent)
    private readonly eventRepository: Repository<BazaarEvent>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(dto: CreateEventDto, userId: number) {
    const code = await this.uniqueCode(dto.code || dto.name);
    const event = await this.eventRepository.manager.transaction(async (manager) => {
      if (dto.isActive !== false) {
        await manager.update(BazaarEvent, { isActive: true }, { isActive: false });
      }
      return manager.save(BazaarEvent, { ...dto, code });
    });
    await this.auditLogService.log({
      userId,
      action: 'CREATE_BAZAAR_EVENT',
      module: 'bazaar',
      entityType: 'bazaar_event',
      entityId: event.id,
      newValues: event,
    });
    return event;
  }

  findAll() {
    return this.eventRepository.find({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async findActive() {
    const event = await this.eventRepository.findOne({
      where: { isActive: true, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
    if (!event) throw new NotFoundException('Tidak ada event bazar aktif');
    return event;
  }

  async findOne(id: number) {
    const event = await this.eventRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!event) throw new NotFoundException('Event tidak ditemukan');
    return event;
  }

  async update(id: number, dto: UpdateEventDto, userId: number) {
    const event = await this.findOne(id);
    const oldValues = { ...event };
    await this.eventRepository.manager.transaction(async (manager) => {
      if (dto.isActive === true) {
        await manager.update(
          BazaarEvent,
          { id: Not(id), isActive: true },
          { isActive: false },
        );
      }
      if (dto.code && dto.code !== event.code) {
        dto.code = await this.uniqueCode(dto.code, id);
      }
      Object.assign(event, dto);
      await manager.save(event);
    });
    await this.auditLogService.log({
      userId,
      action: 'UPDATE_BAZAAR_EVENT',
      module: 'bazaar',
      entityType: 'bazaar_event',
      entityId: id,
      oldValues,
      newValues: event,
    });
    return event;
  }

  async remove(id: number, userId: number) {
    const event = await this.findOne(id);
    await this.eventRepository.softRemove(event);
    await this.auditLogService.log({
      userId,
      action: 'DELETE_BAZAAR_EVENT',
      module: 'bazaar',
      entityType: 'bazaar_event',
      entityId: id,
      oldValues: event,
    });
  }

  private async uniqueCode(value: string, excludedId?: number): Promise<string> {
    const base = value.toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 20) || 'BAZAAR';
    let code = base;
    let suffix = 2;
    while (true) {
      const existing = await this.eventRepository.findOne({ where: { code } });
      if (!existing || existing.id === excludedId) return code;
      code = `${base.slice(0, 17)}${suffix++}`;
    }
  }
}
