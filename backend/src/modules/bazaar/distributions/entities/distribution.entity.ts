import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BazaarOrder } from '../../orders/entities/order.entity';
import { User } from '../../../auth/entities/user.entity';

@Entity('distributions')
export class Distribution {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => BazaarOrder)
  @JoinColumn({ name: 'order_id' })
  order: BazaarOrder;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'distributed_by' })
  distributedBy: User;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'distributed_at' })
  distributedAt: Date;
}
