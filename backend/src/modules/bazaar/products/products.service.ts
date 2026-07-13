import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { AuditLogService } from '../../audit-logs/audit-log.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BazaarProduct } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(BazaarProduct)
    private readonly productRepository: Repository<BazaarProduct>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(dto: CreateProductDto, userId: number) {
    const slug = await this.uniqueSlug(dto.slug || dto.name);
    const product = this.productRepository.create({ ...dto, slug });
    const saved = await this.productRepository.save(product);
    await this.auditLogService.log({
      userId,
      action: 'CREATE_PRODUCT',
      module: 'bazaar',
      entityType: 'bazaar_product',
      entityId: saved.id,
      newValues: saved,
      description: `Produk ${saved.name} dibuat`,
    });
    return saved;
  }

  findAll(eventId?: number) {
    return this.productRepository.find({
      where: {
        ...(eventId ? { eventId } : {}),
        deletedAt: IsNull(),
      },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!product) throw new NotFoundException('Produk tidak ditemukan');
    return product;
  }

  async update(id: number, dto: UpdateProductDto, userId: number) {
    const product = await this.findOne(id);
    const oldValues = { ...product };
    if (dto.slug && dto.slug !== product.slug) {
      dto.slug = await this.uniqueSlug(dto.slug, id);
    }
    Object.assign(product, dto);
    const saved = await this.productRepository.save(product);
    await this.auditLogService.log({
      userId,
      action: 'UPDATE_PRODUCT',
      module: 'bazaar',
      entityType: 'bazaar_product',
      entityId: id,
      oldValues,
      newValues: saved,
      description: `Produk ${saved.name} diubah`,
    });
    return saved;
  }

  async remove(id: number, userId: number) {
    const product = await this.findOne(id);
    await this.productRepository.softRemove(product);
    await this.auditLogService.log({
      userId,
      action: 'DELETE_PRODUCT',
      module: 'bazaar',
      entityType: 'bazaar_product',
      entityId: id,
      oldValues: product,
      description: `Produk ${product.name} dihapus`,
    });
  }

  private async uniqueSlug(value: string, excludedId?: number): Promise<string> {
    const base = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (!base) throw new BadRequestException('Slug produk tidak valid');

    let slug = base;
    let suffix = 2;
    while (true) {
      const existing = await this.productRepository.findOne({ where: { slug } });
      if (!existing || existing.id === excludedId) return slug;
      slug = `${base}-${suffix++}`;
    }
  }
}
