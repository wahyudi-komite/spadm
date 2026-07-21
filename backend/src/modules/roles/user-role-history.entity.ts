import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Member } from '../members/entities/member.entity';
import { Role } from './role.entity';

@Entity('user_role_histories')
export class UserRoleHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  memberId: number;

  @Column()
  roleId: number;

  @Column({ nullable: true })
  areaId: number;

  @Column({ nullable: true })
  startsAt: Date;

  @Column({ nullable: true })
  endsAt: Date;

  @Column({ length: 20 })
  status: string;

  @Column({ type: 'enum', enum: ['ASSIGN', 'REVOKE'] })
  action: 'ASSIGN' | 'REVOKE';

  @Column()
  changedBy: number;

  @Column({ length: 255, nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId' })
  role: Role;
}
