import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BazaarOrder } from '../../orders/entities/order.entity';
import { Member } from '../../../members/entities/member.entity';

@Entity('distributions')
export class Distribution {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => BazaarOrder)
  @JoinColumn({ name: 'order_id' })
  order: BazaarOrder;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'distributed_by' })
  distributedBy: Member;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'distributed_at' })
  distributedAt: Date;
}
