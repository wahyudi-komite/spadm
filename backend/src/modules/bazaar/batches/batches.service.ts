import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { AuditLogService } from '../../audit-logs/audit-log.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { BatchStatus, BazaarBatch } from './entities/batch.entity';

const allowedTransitions: Record<BatchStatus, BatchStatus[]> = {
  [BatchStatus.DRAFT]: [BatchStatus.SCHEDULED, BatchStatus.OPEN, BatchStatus.CANCELLED],
  [BatchStatus.SCHEDULED]: [BatchStatus.OPEN, BatchStatus.CANCELLED],
  [BatchStatus.OPEN]: [BatchStatus.CLOSED, BatchStatus.CANCELLED],
  [BatchStatus.CLOSED]: [BatchStatus.OPEN, BatchStatus.DISTRIBUTION, BatchStatus.CANCELLED],
  [BatchStatus.DISTRIBUTION]: [BatchStatus.COMPLETED, BatchStatus.CANCELLED],
  [BatchStatus.COMPLETED]: [],
  [BatchStatus.CANCELLED]: [],
};

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(BazaarBatch)
    private readonly batchRepository: Repository<BazaarBatch>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(dto: CreateBatchDto, userId: number) {
    this.validateDates(dto);
    const batch = await this.batchRepository.save(
      this.batchRepository.create({
        ...dto,
        createdBy: userId,
        updatedBy: userId,
      }),
    );
    await this.audit('CREATE_BATCH', batch, userId);
    return batch;
  }

  findAll(eventId?: number) {
    return this.batchRepository.find({
      where: {
        ...(eventId ? { eventId } : {}),
        deletedAt: IsNull(),
      },
      order: { createdAt: 'DESC' },
      relations: { event: true },
    });
  }

  async findCurrent(eventId: number) {
    const batch = await this.batchRepository.findOne({
      where: { eventId, status: BatchStatus.OPEN, deletedAt: IsNull() },
      relations: { event: true },
    });
    if (!batch) throw new NotFoundException('Tidak ada batch yang sedang dibuka');
    return batch;
  }

  async findOne(id: number) {
    const batch = await this.batchRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { event: true },
    });
    if (!batch) throw new NotFoundException('Batch tidak ditemukan');
    return batch;
  }

  async update(id: number, dto: UpdateBatchDto, userId: number) {
    const batch = await this.findOne(id);
    if (dto.status && dto.status !== batch.status) {
      throw new BadRequestException('Gunakan endpoint action untuk mengubah status batch');
    }
    this.validateDates({ ...batch, ...dto });
    Object.assign(batch, dto, { updatedBy: userId });
    const saved = await this.batchRepository.save(batch);
    await this.audit('UPDATE_BATCH', saved, userId);
    return saved;
  }

  async transition(id: number, target: BatchStatus, userId: number) {
    const batch = await this.findOne(id);
    if (!allowedTransitions[batch.status].includes(target)) {
      throw new BadRequestException(
        `Perubahan status ${batch.status} ke ${target} tidak diperbolehkan`,
      );
    }

    await this.batchRepository.manager.transaction(async (manager) => {
      if (target === BatchStatus.OPEN) {
        await manager.update(
          BazaarBatch,
          {
            eventId: batch.eventId,
            id: Not(batch.id),
            status: BatchStatus.OPEN,
          },
          {
            status: BatchStatus.CLOSED,
            isPurchaseEnabled: false,
            updatedBy: userId,
          },
        );
      }
      batch.status = target;
      batch.isPurchaseEnabled = target === BatchStatus.OPEN;
      batch.updatedBy = userId;
      await manager.save(batch);
    });

    await this.audit(`BATCH_${target}`, batch, userId);
    return batch;
  }

  async remove(id: number, userId: number) {
    const batch = await this.findOne(id);
    if (![BatchStatus.DRAFT, BatchStatus.CANCELLED].includes(batch.status)) {
      throw new BadRequestException('Hanya batch draft atau cancelled yang dapat dihapus');
    }
    await this.batchRepository.softRemove(batch);
    await this.audit('DELETE_BATCH', batch, userId);
  }

  private validateDates(dto: {
    purchaseStartAt?: string | Date | null;
    purchaseEndAt?: string | Date | null;
    distributionStartAt?: string | Date | null;
    distributionEndAt?: string | Date | null;
  }): void {
    const purchaseStart = dto.purchaseStartAt ? new Date(dto.purchaseStartAt) : undefined;
    const purchaseEnd = dto.purchaseEndAt ? new Date(dto.purchaseEndAt) : undefined;
    const distributionStart = dto.distributionStartAt
      ? new Date(dto.distributionStartAt)
      : undefined;
    const distributionEnd = dto.distributionEndAt
      ? new Date(dto.distributionEndAt)
      : undefined;

    if (purchaseStart && purchaseEnd && purchaseEnd <= purchaseStart) {
      throw new BadRequestException('Jadwal akhir pembelian harus setelah jadwal mulai');
    }
    if (distributionStart && distributionEnd && distributionEnd <= distributionStart) {
      throw new BadRequestException('Jadwal akhir distribusi harus setelah jadwal mulai');
    }
  }

  private async audit(action: string, batch: BazaarBatch, userId: number) {
    await this.auditLogService.log({
      userId,
      action,
      module: 'bazaar',
      entityType: 'bazaar_batch',
      entityId: batch.id,
      newValues: batch,
      description: `${action}: ${batch.name}`,
    });
  }
}
