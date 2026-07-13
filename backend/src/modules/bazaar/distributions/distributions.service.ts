import { Injectable, NotFoundException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Distribution } from './entities/distribution.entity';
import { PickupToken } from './entities/pickup-token.entity';
import { OrdersService } from '../orders/orders.service';
import { DistributionArea } from './entities/distribution-area.entity';
import { OrganizationalUnitAreaMapping } from './entities/ou-area-mapping.entity';
import { CreateAreaMappingDto } from './dto/create-area-mapping.dto';
import { AuditLogService } from '../../audit-logs/audit-log.service';
import { IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { UserRole } from '../../roles/user-role.entity';
import { OrderStatus, BazaarOrder } from '../orders/entities/order.entity';
import { BatchStatus } from '../batches/entities/batch.entity';
import { BazaarOrderStatusHistory } from '../orders/entities/order-status-history.entity';
import { DistributionHistory } from './entities/distribution-history.entity';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class DistributionsService {
  constructor(
    @InjectRepository(Distribution)
    private distributionRepo: Repository<Distribution>,
    @InjectRepository(PickupToken)
    private pickupTokenRepo: Repository<PickupToken>,
    @InjectRepository(DistributionArea)
    private distributionAreaRepo: Repository<DistributionArea>,
    @InjectRepository(OrganizationalUnitAreaMapping)
    private areaMappingRepo: Repository<OrganizationalUnitAreaMapping>,
    @InjectRepository(UserRole)
    private userRoleRepo: Repository<UserRole>,
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
    private auditLogService: AuditLogService,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
  ) {}

  async generatePickupToken(orderId: number) {
    const existing = await this.pickupTokenRepo.findOne({ where: { order: { id: orderId } } });
    if (existing) return this.presentToken(existing);

    const tokenCode = randomUUID();
    const token = this.pickupTokenRepo.create({
      order: { id: orderId },
      tokenCode,
      isUsed: false
    });
    return this.presentToken(await this.pickupTokenRepo.save(token));
  }

  async validateToken(qrToken: string, picUserId: number) {
    const tokenCode = this.verifyAndExtractToken(qrToken);
    const token = await this.pickupTokenRepo.findOne({
      where: { tokenCode },
      relations: {
        order: {
          user: { member: true },
          event: true,
          batch: true,
          distributionArea: true,
          items: { product: true },
        },
      },
    });

    if (!token) throw new NotFoundException('Token pengambilan tidak valid');
    if (token.isUsed) throw new BadRequestException('Token pengambilan ini sudah digunakan');
    if (![OrderStatus.CONFIRMED, OrderStatus.PAID].includes(token.order.status)) {
      throw new BadRequestException('Pembayaran order belum berhasil');
    }
    if (token.order.batch.status !== BatchStatus.DISTRIBUTION) {
      throw new BadRequestException('Batch belum memasuki periode distribusi');
    }
    if (token.order.user.member?.status !== 'active') {
      throw new BadRequestException('Status anggota tidak aktif');
    }

    await this.assertPicAreaAccess(picUserId, token.order.distributionAreaId);

    return this.presentToken(token);
  }

  async confirmDistribution(qrToken: string, picUserId: number, notes?: string) {
    const validated = await this.validateToken(qrToken, picUserId);
    const distribution = await this.distributionRepo.manager.transaction(
      async (manager) => {
        const tokenUpdate = await manager.update(
          PickupToken,
          { id: validated.id, isUsed: false },
          { isUsed: true },
        );
        if (tokenUpdate.affected !== 1) {
          throw new BadRequestException('QR pengambilan sudah digunakan');
        }

        const saved = await manager.save(
          Distribution,
          manager.create(Distribution, {
            order: { id: validated.order.id },
            distributedBy: { id: picUserId },
            notes,
          }),
        );
        await manager.update(BazaarOrder, validated.order.id, {
          status: OrderStatus.COMPLETED,
        });
        await manager.save(BazaarOrderStatusHistory, {
          order: { id: validated.order.id },
          status: OrderStatus.COMPLETED,
          notes: 'Seluruh barang telah diserahkan',
          createdBy: String(picUserId),
        });
        await manager.save(DistributionHistory, {
          distributionId: saved.id,
          orderId: validated.order.id,
          performedBy: picUserId,
          action: 'DISTRIBUTED',
          notes,
        });
        return saved;
      },
    );
    await this.auditLogService.log({
      userId: picUserId,
      action: 'CONFIRM_DISTRIBUTION',
      module: 'bazaar',
      entityType: 'distribution',
      entityId: distribution.id,
      description: `Order ${validated.order.orderNumber} diserahkan`,
    });
    await this.notificationsService.notifyOrderDistributed(validated.order.id);
    return distribution;
  }

  async getTokenByOrder(orderId: number, userId: number) {
    await this.ordersService.getOrderById(orderId, userId);
    const token = await this.pickupTokenRepo.findOne({
      where: { order: { id: orderId } },
    });
    return token ? this.presentToken(token) : null;
  }

  findAreas() {
    return this.distributionAreaRepo.find({
      where: { isActive: true, deletedAt: IsNull() },
      order: { code: 'ASC' },
    });
  }

  findMappings() {
    return this.areaMappingRepo.find({
      where: { deletedAt: IsNull() },
      relations: { distributionArea: true },
      order: { plant: 'ASC', workUnit: 'ASC' },
    });
  }

  async createMapping(dto: CreateAreaMappingDto, userId: number) {
    const area = await this.distributionAreaRepo.findOne({
      where: { id: dto.distributionAreaId, isActive: true, deletedAt: IsNull() },
    });
    if (!area) throw new NotFoundException('Area distribusi tidak ditemukan');

    const existing = await this.areaMappingRepo.findOne({
      where: {
        plant: dto.plant.trim(),
        workUnit: dto.workUnit.trim(),
        deletedAt: IsNull(),
      },
    });
    if (existing) {
      throw new BadRequestException('Mapping plant dan unit kerja sudah tersedia');
    }

    const mapping = await this.areaMappingRepo.save(
      this.areaMappingRepo.create({
        ...dto,
        plant: dto.plant.trim(),
        workUnit: dto.workUnit.trim(),
      }),
    );
    await this.auditLogService.log({
      userId,
      action: 'CREATE_AREA_MAPPING',
      module: 'bazaar',
      entityType: 'organizational_unit_area_mapping',
      entityId: mapping.id,
      newValues: mapping,
    });
    return mapping;
  }

  async removeMapping(id: number, userId: number) {
    const mapping = await this.areaMappingRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!mapping) throw new NotFoundException('Mapping area tidak ditemukan');
    await this.areaMappingRepo.softRemove(mapping);
    await this.auditLogService.log({
      userId,
      action: 'DELETE_AREA_MAPPING',
      module: 'bazaar',
      entityType: 'organizational_unit_area_mapping',
      entityId: id,
      oldValues: mapping,
    });
  }

  private async assertPicAreaAccess(userId: number, areaId: number): Promise<void> {
    const now = new Date();
    const assignments = await this.userRoleRepo
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.role', 'role')
      .where('assignment.userId = :userId', { userId })
      .andWhere('assignment.status = :status', { status: 'ACTIVE' })
      .andWhere('assignment.revokedAt IS NULL')
      .andWhere('(assignment.startsAt IS NULL OR assignment.startsAt <= :now)', { now })
      .andWhere('(assignment.endsAt IS NULL OR assignment.endsAt >= :now)', { now })
      .getMany();

    const unrestricted = assignments.some((assignment) =>
      ['SUPER_ADMIN', 'BAZAAR_ADMIN'].includes(assignment.role.name),
    );
    const matchingArea = assignments.some(
      (assignment) =>
        assignment.role.name === 'AREA_PIC' && assignment.areaId === areaId,
    );
    if (!unrestricted && !matchingArea) {
      throw new BadRequestException('PIC tidak memiliki akses ke area order ini');
    }
  }

  private presentToken(token: PickupToken) {
    return {
      ...token,
      tokenCode: `${token.tokenCode}.${this.signToken(token.tokenCode)}`,
    };
  }

  private verifyAndExtractToken(value: string): string {
    const separator = value.lastIndexOf('.');
    if (separator < 1) throw new BadRequestException('Format QR tidak valid');
    const tokenCode = value.slice(0, separator);
    const signature = value.slice(separator + 1);
    const expected = this.signToken(tokenCode);
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      actualBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      throw new BadRequestException('Signature QR tidak valid');
    }
    return tokenCode;
  }

  private signToken(tokenCode: string): string {
    const secret = this.configService.getOrThrow<string>('PICKUP_TOKEN_SECRET');
    return createHmac('sha256', secret).update(tokenCode).digest('base64url');
  }
}
