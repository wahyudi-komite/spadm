import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(params: {
    userId?: number;
    action: string;
    module: string;
    entityType?: string;
    entityId?: number;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    description?: string;
  }) {
    const entry = this.auditLogRepository.create(params);
    return this.auditLogRepository.save(entry);
  }

  async findAll(query: { page?: number; limit?: number; module?: string; action?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.module) where.module = query.module;
    if (query.action) where.action = query.action;

    const [data, total] = await this.auditLogRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
