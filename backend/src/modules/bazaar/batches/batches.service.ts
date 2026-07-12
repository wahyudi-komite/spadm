import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BazaarBatch } from './entities/batch.entity';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(BazaarBatch)
    private readonly batchRepo: Repository<BazaarBatch>,
  ) {}

  create(createBatchDto: CreateBatchDto) {
    const batch = this.batchRepo.create(createBatchDto);
    return this.batchRepo.save(batch);
  }

  findAll() {
    return this.batchRepo.find({ order: { createdAt: 'DESC' }, relations: { event: true } });
  }

  async findOne(id: number) {
    const batch = await this.batchRepo.findOne({ where: { id }, relations: { event: true } });
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }

  async update(id: number, updateBatchDto: UpdateBatchDto) {
    const batch = await this.findOne(id);
    Object.assign(batch, updateBatchDto);
    return this.batchRepo.save(batch);
  }

  async remove(id: number) {
    const batch = await this.findOne(id);
    return this.batchRepo.softRemove(batch);
  }
}
