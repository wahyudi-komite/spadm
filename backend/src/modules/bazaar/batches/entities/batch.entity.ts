import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BazaarEvent } from '../../events/entities/event.entity';

export enum BatchStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  DISTRIBUTION = 'DISTRIBUTION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('bazaar_batches')
export class BazaarBatch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'event_id' })
  eventId: number;

  @ManyToOne(() => BazaarEvent, event => event.batches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: BazaarEvent;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'purchase_start_at', type: 'timestamp', nullable: true })
  purchaseStartAt: Date;

  @Column({ name: 'purchase_end_at', type: 'timestamp', nullable: true })
  purchaseEndAt: Date;

  @Column({ name: 'distribution_start_at', type: 'timestamp', nullable: true })
  distributionStartAt: Date;

  @Column({ name: 'distribution_end_at', type: 'timestamp', nullable: true })
  distributionEndAt: Date;

  @Column({ type: 'varchar', length: 50, default: BatchStatus.DRAFT })
  status: BatchStatus;

  @Column({ name: 'is_purchase_enabled', type: 'boolean', default: false })
  isPurchaseEnabled: boolean;

  @Column({ name: 'display_next_batch_information', type: 'boolean', default: false })
  displayNextBatchInformation: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy: number;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
