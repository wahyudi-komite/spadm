import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Member } from '../../../members/entities/member.entity';
import { BazaarEvent } from '../../events/entities/event.entity';
import { BazaarBatch } from '../../batches/entities/batch.entity';
import { DistributionArea } from '../../distributions/entities/distribution-area.entity';
import { BazaarOrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  COMPLETED = 'COMPLETED'
}

@Entity('bazaar_orders')
export class BazaarOrder {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'order_number', length: 40, unique: true })
  orderNumber: string;

  // We link to User, but logically represents a Member. The requirement says members log in via NPK (which is User).
  @ManyToOne(() => Member)
  @JoinColumn({ name: 'user_id' })
  member: Member;

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

  @Column({ name: 'distribution_area_id', nullable: true })
  distributionAreaId: number;

  @ManyToOne(() => DistributionArea, { nullable: true })
  @JoinColumn({ name: 'distribution_area_id' })
  distributionArea: DistributionArea;

  @Column({ name: 'terms_accepted', type: 'boolean', default: false })
  termsAccepted: boolean;

  @Column({ name: 'terms_version', length: 20, nullable: true })
  termsVersion: string;

  @Column({ name: 'terms_accepted_at', type: 'timestamp', nullable: true })
  termsAcceptedAt: Date;

  @Column({ name: 'cancel_reason', type: 'text', nullable: true })
  cancelReason: string | null;

  @OneToMany(() => BazaarOrderItem, item => item.order, { cascade: true })
  items: BazaarOrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
