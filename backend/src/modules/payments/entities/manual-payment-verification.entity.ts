import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('manual_payment_verifications')
export class ManualPaymentVerification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  paymentId: number;

  @Column()
  verifiedBy: number;

  @Column({ length: 30 })
  previousStatus: string;

  @Column({ length: 30 })
  newStatus: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 255 })
  paymentReference: string;

  @Column({ length: 500 })
  reason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
