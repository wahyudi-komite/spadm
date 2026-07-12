import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../../auth/entities/user.entity';
import { BazaarEvent } from '../../events/entities/event.entity';
import { BazaarBatch } from '../../batches/entities/batch.entity';
import { BazaarOrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

@Entity('bazaar_orders')
export class BazaarOrder {
  @PrimaryGeneratedColumn('increment')
  id: number;

  // We link to User, but logically represents a Member. The requirement says members log in via NPK (which is User).
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => BazaarEvent)
  @JoinColumn({ name: 'event_id' })
  event: BazaarEvent;

  @ManyToOne(() => BazaarBatch)
  @JoinColumn({ name: 'batch_id' })
  batch: BazaarBatch;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  productSubtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  goodieBagFee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  applicationFee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subsidy: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  grandTotal: number;

  @OneToMany(() => BazaarOrderItem, item => item.order, { cascade: true })
  items: BazaarOrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
