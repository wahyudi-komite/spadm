import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BazaarOrder, OrderStatus } from './entities/order.entity';
import { BazaarOrderItem } from './entities/order-item.entity';
import { BazaarOrderStatusHistory } from './entities/order-status-history.entity';
import { BazaarProduct } from '../products/entities/product.entity';
import { BazaarBatch } from '../batches/entities/batch.entity';

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
    private batchRepo: Repository<BazaarBatch>
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
      const product = await this.productRepo.findOne({ where: { id } });
      if (!product) throw new NotFoundException(`Produk ID ${id} tidak ditemukan`);
      
      // Basic stock check
      if (product.inventoryMode !== 'UNLIMITED' && product.stock <= 0) {
        throw new BadRequestException(`Produk ${product.name} telah habis`);
      }

      productSubtotal += Number(product.sellingPrice);
      products.push(product);
    }

    const goodieBagFee = 3000;
    const applicationFee = 1000;
    const subsidy = 20000;
    const grandTotal = productSubtotal + goodieBagFee + applicationFee - subsidy;

    return {
      products,
      breakdown: {
        productSubtotal,
        goodieBagFee,
        applicationFee,
        subsidy,
        grandTotal: grandTotal < 0 ? 0 : grandTotal // Prevent negative total
      }
    };
  }

  async checkout(userId: number, eventId: number, productIds: number[]) {
    // 1. Check if user already has a pending or successful order for this event
    const existingOrder = await this.orderRepo.findOne({
      where: [
        { user: { id: userId }, event: { id: eventId }, status: OrderStatus.PENDING },
        { user: { id: userId }, event: { id: eventId }, status: OrderStatus.PAID }
      ]
    });

    if (existingOrder) {
      throw new BadRequestException('Anda sudah memiliki pesanan aktif atau berhasil pada event ini.');
    }

    // 2. Find active batch for this event
    const activeBatch = await this.batchRepo.findOne({
      where: { event: { id: eventId }, status: 'OPEN' }
    });

    if (!activeBatch) {
      throw new BadRequestException('Tidak ada batch yang terbuka untuk event ini.');
    }

    // 3. Calculate Cart
    const cart = await this.calculateCart(productIds);

    // 4. Create Order
    const order = this.orderRepo.create({
      user: { id: userId },
      event: { id: eventId },
      batch: { id: activeBatch.id },
      status: OrderStatus.PENDING,
      productSubtotal: cart.breakdown.productSubtotal,
      goodieBagFee: cart.breakdown.goodieBagFee,
      applicationFee: cart.breakdown.applicationFee,
      subsidy: cart.breakdown.subsidy,
      grandTotal: cart.breakdown.grandTotal
    });

    const savedOrder = await this.orderRepo.save(order);

    // 5. Create Order Items
    for (const product of cart.products) {
      const item = this.orderItemRepo.create({
        order: { id: savedOrder.id },
        product: { id: product.id },
        productNameSnapshot: product.name,
        productPriceSnapshot: product.sellingPrice,
        quantity: 1,
        subtotal: product.sellingPrice
      });
      await this.orderItemRepo.save(item);
    }

    // 6. Record History
    const history = this.statusHistoryRepo.create({
      order: { id: savedOrder.id },
      status: OrderStatus.PENDING,
      notes: 'Order placed',
      createdBy: 'SYSTEM'
    });
    await this.statusHistoryRepo.save(history);

    // Return the full order
    return this.orderRepo.findOne({
      where: { id: savedOrder.id },
      relations: { items: true, event: true, batch: true }
    });
  }

  async getMyOrders(userId: number) {
    return this.orderRepo.find({
      where: { user: { id: userId } },
      relations: { items: true, event: true, batch: true },
      order: { createdAt: 'DESC' }
    });
  }
}
