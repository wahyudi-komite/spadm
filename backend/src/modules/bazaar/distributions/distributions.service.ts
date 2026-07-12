import { Injectable, NotFoundException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Distribution } from './entities/distribution.entity';
import { PickupToken } from './entities/pickup-token.entity';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class DistributionsService {
  constructor(
    @InjectRepository(Distribution)
    private distributionRepo: Repository<Distribution>,
    @InjectRepository(PickupToken)
    private pickupTokenRepo: Repository<PickupToken>,
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService
  ) {}

  async generatePickupToken(orderId: number) {
    const existing = await this.pickupTokenRepo.findOne({ where: { order: { id: orderId } } });
    if (existing) return existing;

    const tokenCode = `PU-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const token = this.pickupTokenRepo.create({
      order: { id: orderId },
      tokenCode,
      isUsed: false
    });
    return this.pickupTokenRepo.save(token);
  }

  async validateToken(tokenCode: string) {
    const token = await this.pickupTokenRepo.findOne({
      where: { tokenCode },
      relations: { order: { user: true, event: true, batch: true, items: { product: true } } }
    });

    if (!token) throw new NotFoundException('Token pengambilan tidak valid');
    if (token.isUsed) throw new BadRequestException('Token pengambilan ini sudah digunakan');
    
    // Additional validation could be checked here (e.g., is the PIC authorized for this user's area?)

    return token;
  }

  async confirmDistribution(tokenCode: string, picUserId: number, notes?: string) {
    const token = await this.validateToken(tokenCode);

    // Mark as used
    token.isUsed = true;
    await this.pickupTokenRepo.save(token);

    // Record distribution
    const distribution = this.distributionRepo.create({
      order: { id: token.order.id },
      distributedBy: { id: picUserId },
      notes
    });
    await this.distributionRepo.save(distribution);

    // Update order status
    // To avoid circular dep error at runtime or compile time, just update repo or use service.
    // Actually using OrdersService is fine if we use forwardRef
    await this.ordersService.updateOrderStatus(token.order.id, 'COMPLETED');

    return distribution;
  }

  async getTokenByOrder(orderId: number) {
    return this.pickupTokenRepo.findOne({ where: { order: { id: orderId } } });
  }
}
