import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BazaarOrder, OrderStatus } from './entities/order.entity';
import { BazaarOrderItem } from './entities/order-item.entity';
import { BazaarOrderStatusHistory } from './entities/order-status-history.entity';
import { BazaarProduct } from '../products/entities/product.entity';
import { BazaarEvent } from '../events/entities/event.entity';
import { BazaarBatch } from '../batches/entities/batch.entity';
import { BatchStatus } from '../batches/entities/batch.entity';
import { OrganizationalUnitAreaMapping } from '../distributions/entities/ou-area-mapping.entity';
import { DistributionArea } from '../distributions/entities/distribution-area.entity';
import { Member } from '../../members/entities/member.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(BazaarOrder)
    private orderRepo: Repository<BazaarOrder>,
    @InjectRepository(BazaarOrderItem)
    private orderItemRepo: Repository<BazaarOrderItem>,
    @InjectRepository(BazaarOrderStatusHistory)
    private statusHistoryRepo: Repository<BazaarOrderStatusHistory>,
    @InjectRepository(BazaarProduct)
    private productRepo: Repository<BazaarProduct>,
    @InjectRepository(BazaarBatch)
    private batchRepo: Repository<BazaarBatch>,
    @InjectRepository(OrganizationalUnitAreaMapping)
    private areaMappingRepo: Repository<OrganizationalUnitAreaMapping>,
    @InjectRepository(Member)
    private memberRepo: Repository<Member>,
    @InjectRepository(BazaarEvent)
    private eventRepo: Repository<BazaarEvent>
  ) {}

  async calculateCart(productIds: number[]) {
    if (!productIds || productIds.length === 0) {
      throw new BadRequestException('Keranjang kosong');
    }

    const uniqueProductIds = [...new Set(productIds)];
    if (uniqueProductIds.length !== productIds.length) {
      throw new BadRequestException('Maksimal 1 unit per produk');
    }

    let productSubtotal = 0;
    const products = [];

    for (const id of uniqueProductIds) {
      const product = await this.productRepo.findOne({
        where: { id, isActive: true },
        relations: { event: true },
      });
      if (!product) throw new NotFoundException(`Produk ID ${id} tidak ditemukan`);
      
      if (product.inventoryMode !== 'UNLIMITED' && product.stock <= 0) {
        throw new BadRequestException(`Produk ${product.name} telah habis`);
      }

      productSubtotal += Number(product.sellingPrice);
      products.push(product);
    }

    const eventIds = new Set(products.map((product) => product.eventId));
    if (eventIds.size !== 1) {
      throw new BadRequestException('Semua produk harus berasal dari event yang sama');
    }
    const event = products[0].event;
    const goodieBagFee = Number(event.goodieBagFee);
    const applicationFee = Number(event.applicationFee);
    const subsidy = Number(event.subsidy);
    const grandTotal = productSubtotal + goodieBagFee + applicationFee - subsidy;

    return {
      products,
      breakdown: {
        productSubtotal,
        goodieBagFee,
        applicationFee,
        subsidy,
        grandTotal: grandTotal < 0 ? 0 : grandTotal
      }
    };
  }

  async resolveMemberArea(userId: number): Promise<{
    area: DistributionArea;
    mapping: OrganizationalUnitAreaMapping | null;
  } | null> {
    const member = await this.memberRepo.findOne({
      where: { id: userId }
    });

    if (!member || !member.plant || !member.workUnit) return null;

    // Check if member already has a pre-assigned area
    if (member.distributionAreaId) {
      const area = await this.memberRepo.manager.findOne(DistributionArea, {
        where: { id: member.distributionAreaId, isActive: true }
      });
      if (area) return { area, mapping: null };
    }

    // Resolve via OU area mapping
    const mapping = await this.areaMappingRepo.findOne({
      where: {
        plant: member.plant,
        workUnit: member.workUnit,
        isActive: true
      },
      relations: { distributionArea: true }
    });

    if (!mapping || !mapping.distributionArea?.isActive) return null;

    return { area: mapping.distributionArea, mapping };
  }

  async validateCheckout(userId: number, eventId: number, productIds: number[]) {
    const uniqueProductIds = [...new Set(productIds)];
    if (uniqueProductIds.length !== productIds.length) {
      throw new BadRequestException('Maksimal 1 unit per produk');
    }

    // Check existing order
    const existingOrder = await this.orderRepo.findOne({
      where: [
        { member: { id: userId }, event: { id: eventId }, status: OrderStatus.PENDING },
        { member: { id: userId }, event: { id: eventId }, status: OrderStatus.PAID },
        { member: { id: userId }, event: { id: eventId }, status: OrderStatus.CONFIRMED }
      ]
    });

    if (existingOrder) {
      throw new BadRequestException('Anda sudah memiliki pesanan aktif atau berhasil pada event ini.');
    }

    // Check event exists and is active
    const event = await this.eventRepo.findOne({ where: { id: eventId, isActive: true } });
    if (!event) {
      throw new BadRequestException('Event tidak ditemukan atau tidak aktif.');
    }

    // Check active batch with time-range validation
    const now = new Date();
    const activeBatch = await this.batchRepo.findOne({
      where: { event: { id: eventId }, status: BatchStatus.OPEN, isPurchaseEnabled: true }
    });

    if (!activeBatch) {
      throw new BadRequestException('Tidak ada batch yang terbuka untuk event ini.');
    }

    if (activeBatch.purchaseStartAt && new Date(activeBatch.purchaseStartAt) > now) {
      throw new BadRequestException('Pembelian untuk batch ini belum dimulai.');
    }

    if (activeBatch.purchaseEndAt && new Date(activeBatch.purchaseEndAt) < now) {
      throw new BadRequestException('Periode pembelian untuk batch ini sudah berakhir.');
    }

    // Check products exist, are active, and stock
    const products = [];
    for (const id of uniqueProductIds) {
      const product = await this.productRepo.findOne({
        where: { id, isActive: true, event: { id: eventId } }
      });
      if (!product) throw new NotFoundException(`Produk ID ${id} tidak ditemukan`);

      if (product.inventoryMode !== 'UNLIMITED' && product.stock <= 0) {
        throw new BadRequestException(`Produk ${product.name} telah habis`);
      }

      products.push(product);
    }

    // Check member status and resolve area
    const member = await this.memberRepo.findOne({ where: { id: userId } });
    if (!member) {
      throw new BadRequestException('Data anggota tidak ditemukan.');
    }
    if (member.status !== 'active') {
      throw new BadRequestException('Anggota tidak aktif. Tidak dapat melakukan pembelian.');
    }

    const areaResult = await this.resolveMemberArea(userId);
    if (!areaResult) {
      throw new BadRequestException(
        'Area distribusi Anda belum terdaftar. Silakan hubungi admin untuk pemetaan area.'
      );
    }

    return { event, activeBatch, products, member, areaResult };
  }

  async checkout(userId: number, eventId: number, productIds: number[], termsAccepted: boolean) {
    if (!termsAccepted) {
      throw new BadRequestException('Anda harus menyetujui syarat dan ketentuan sebelum checkout.');
    }

    const { event, activeBatch, products, areaResult } = await this.validateCheckout(userId, eventId, productIds);

    let productSubtotal = 0;
    for (const product of products) {
      productSubtotal += Number(product.sellingPrice);
    }

    const goodieBagFee = Number(event.goodieBagFee);
    const applicationFee = Number(event.applicationFee);
    const subsidy = Number(event.subsidy);
    const grandTotal = productSubtotal + goodieBagFee + applicationFee - subsidy;

    let savedOrderId: number;
    try {
      savedOrderId = await this.orderRepo.manager.transaction(async (manager) => {
        const duplicate = await manager.findOne(BazaarOrder, {
          where: [
            { member: { id: userId }, event: { id: eventId }, status: OrderStatus.PENDING },
            { member: { id: userId }, event: { id: eventId }, status: OrderStatus.CONFIRMED },
            { member: { id: userId }, event: { id: eventId }, status: OrderStatus.PAID },
            { member: { id: userId }, event: { id: eventId }, status: OrderStatus.COMPLETED },
          ],
          lock: { mode: 'pessimistic_write' },
        });
        if (duplicate) {
          throw new BadRequestException(
            'Anda sudah memiliki pesanan aktif atau berhasil pada event ini.',
          );
        }

        for (const product of products) {
          if (product.inventoryMode === 'GLOBAL_STOCK') {
            const stockUpdate = await manager
              .createQueryBuilder()
              .update(BazaarProduct)
              .set({ stock: () => 'stock - 1' })
              .where('id = :id AND stock > 0', { id: product.id })
              .execute();
            if (stockUpdate.affected !== 1) {
              throw new BadRequestException(`Stok ${product.name} telah habis`);
            }
          }
        }

        const orderNumber = await this.nextOrderNumber(
          manager,
          event.code,
          event.id,
          activeBatch.id,
          areaResult.area.code,
        );
        const order = manager.create(BazaarOrder, {
          orderNumber,
          member: { id: userId },
          event: { id: event.id },
          batch: { id: activeBatch.id },
          status: OrderStatus.PENDING,
          productSubtotal,
          goodieBagFee,
          applicationFee,
          subsidy,
          grandTotal: Math.max(0, grandTotal),
          distributionAreaId: areaResult.area.id,
          termsAccepted: true,
          termsVersion: '2026-07',
          termsAcceptedAt: new Date(),
        });
        const savedOrder = await manager.save(BazaarOrder, order);

        await manager.save(
          BazaarOrderItem,
          products.map((product) =>
            manager.create(BazaarOrderItem, {
              order: { id: savedOrder.id },
              product: { id: product.id },
              productNameSnapshot: product.name,
              productPriceSnapshot: product.sellingPrice,
              quantity: 1,
              subtotal: product.sellingPrice,
            }),
          ),
        );

        await manager.save(
          BazaarOrderStatusHistory,
          manager.create(BazaarOrderStatusHistory, {
            order: { id: savedOrder.id },
            status: OrderStatus.PENDING,
            notes: 'Order dibuat dan menunggu pembayaran',
            createdBy: 'SYSTEM',
          }),
        );
        return savedOrder.id;
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
        throw new BadRequestException(
          'Pesanan aktif atau pembelian berhasil untuk event ini sudah tersedia.',
        );
      }
      throw error;
    }

    return this.getOrderById(savedOrderId, userId);
  }

  async cancelOrder(orderId: number, userId: number, reason?: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, member: { id: userId } },
      relations: { items: true }
    });

    if (!order) {
      throw new NotFoundException('Order tidak ditemukan');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Pesanan dengan status ${order.status} tidak dapat dibatalkan. Hanya pesanan PENDING yang dapat dibatalkan.`
      );
    }

    order.status = OrderStatus.CANCELLED;
    order.cancelReason = reason || null;
    await this.orderRepo.save(order);

    const history = this.statusHistoryRepo.create({
      order: { id: orderId },
      status: OrderStatus.CANCELLED,
      notes: reason ? `Dibatalkan: ${reason}` : 'Dibatalkan oleh anggota',
      createdBy: 'USER'
    });
    await this.statusHistoryRepo.save(history);

    return this.orderRepo.findOne({
      where: { id: orderId },
      relations: { items: true, event: true, batch: true, distributionArea: true }
    });
  }

  async getMyOrders(userId: number) {
    return this.orderRepo.find({
      where: { id: userId },
      relations: { items: true, event: true, batch: true, distributionArea: true },
      order: { createdAt: 'DESC' }
    });
  }

  async getOrderById(orderId: number, userId?: number) {
    const where = userId ? { id: orderId, member: { id: userId } } : { id: orderId };
    const order = await this.orderRepo.findOne({
      where,
      relations: { items: true, event: true, batch: true, distributionArea: true }
    });
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    return order;
  }

  async updateOrderStatus(orderId: number, status: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    order.status = status as any;
    await this.orderRepo.save(order);

    const history = this.statusHistoryRepo.create({
      order: { id: orderId },
      status,
      notes: `Status updated to ${status}`,
      createdBy: 'SYSTEM'
    });
    await this.statusHistoryRepo.save(history);

    return order;
  }

  private async nextOrderNumber(
    manager: EntityManager,
    eventCode: string,
    eventId: number,
    batchId: number,
    areaCode: string,
  ): Promise<string> {
    const year = new Date().getFullYear();
    await manager.query(
      `INSERT IGNORE INTO order_sequences
        (event_id, batch_id, sequence_year, next_value)
       VALUES (?, ?, ?, 0)`,
      [eventId, batchId, year],
    );
    await manager.query(
      `UPDATE order_sequences
       SET next_value = LAST_INSERT_ID(next_value + 1)
       WHERE event_id = ? AND batch_id = ? AND sequence_year = ?`,
      [eventId, batchId, year],
    );
    const [row] = await manager.query('SELECT LAST_INSERT_ID() AS sequenceValue');
    const sequence = String(row.sequenceValue).padStart(6, '0');
    return `${eventCode}-B${String(batchId).padStart(2, '0')}-${areaCode}-${year}${sequence}`;
  }
}

