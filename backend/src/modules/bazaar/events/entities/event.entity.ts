import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { BazaarBatch } from '../../batches/entities/batch.entity';
import { BazaarProduct } from '../../products/entities/product.entity';

@Entity('bazaar_events')
export class BazaarEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'banner_image_url', type: 'varchar', length: 500, nullable: true })
  bannerImageUrl: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 20000 })
  subsidy: number;

  @Column({ name: 'goodie_bag_fee', type: 'decimal', precision: 12, scale: 2, default: 3000 })
  goodieBagFee: number;

  @Column({ name: 'application_fee', type: 'decimal', precision: 12, scale: 2, default: 1000 })
  applicationFee: number;

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
