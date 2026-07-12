import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BazaarOrder } from '../../bazaar/orders/entities/order.entity';

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PENDING = 'PENDING',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
  MANUAL_VERIFIED = 'MANUAL_VERIFIED',
  REFUNDED = 'REFUNDED'
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => BazaarOrder)
  @JoinColumn({ name: 'order_id' })
  order: BazaarOrder;

  @Column({ name: 'reference_id', unique: true })
  referenceId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.UNPAID })
  status: PaymentStatus;

  @Column({ type: 'text', name: 'qris_payload', nullable: true })
  qrisPayload: string;

  @Column({ type: 'timestamp', name: 'expired_at', nullable: true })
  expiredAt: Date;

  @Column({ type: 'timestamp', name: 'paid_at', nullable: true })
  paidAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
