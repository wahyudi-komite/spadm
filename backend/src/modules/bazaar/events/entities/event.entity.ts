import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { BazaarBatch } from '../../batches/entities/batch.entity';
import { BazaarProduct } from '../../products/entities/product.entity';

@Entity('bazaar_events')
export class BazaarEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => BazaarBatch, batch => batch.event)
  batches: BazaarBatch[];

  @OneToMany(() => BazaarProduct, product => product.event)
  products: BazaarProduct[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
