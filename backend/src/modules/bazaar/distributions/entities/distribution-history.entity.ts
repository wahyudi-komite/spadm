import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('distribution_histories')
export class DistributionHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  distributionId: number;

  @Column()
  orderId: number;

  @Column()
  performedBy: number;

  @Column({ length: 50 })
  action: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
