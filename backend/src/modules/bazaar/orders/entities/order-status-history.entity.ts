import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BazaarOrder, OrderStatus } from './order.entity';

@Entity('bazaar_order_status_histories')
export class BazaarOrderStatusHistory {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => BazaarOrder)
  @JoinColumn({ name: 'order_id' })
  order: BazaarOrder;

  @Column({ type: 'varchar', length: 20 })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
