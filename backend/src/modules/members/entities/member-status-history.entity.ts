import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('member_status_histories')
export class MemberStatusHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  memberId: number;

  @Column({ length: 20 })
  oldStatus: string;

  @Column({ length: 20 })
  newStatus: string;

  @Column({ length: 255, nullable: true })
  reason: string;

  @Column({ nullable: true })
  changedByUserId: number;

  @CreateDateColumn()
  createdAt: Date;
}
