import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BazaarOrder } from '../../orders/entities/order.entity';

@Entity('pickup_tokens')
export class PickupToken {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => BazaarOrder)
  @JoinColumn({ name: 'order_id' })
  order: BazaarOrder;

  @Column({ name: 'token_code', unique: true })
  tokenCode: string;

  @Column({ type: 'boolean', name: 'is_used', default: false })
  isUsed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
