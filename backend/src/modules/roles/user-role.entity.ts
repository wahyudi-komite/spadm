import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Member } from '../members/entities/member.entity';
import { Role } from './role.entity';

@Entity('user_roles')
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  memberId: number;

  @Column()
  roleId: number;

  @Column({ nullable: true })
  areaId: number;

  @Column({ nullable: true })
  assignedBy: number;

  @CreateDateColumn()
  assignedAt: Date;

  @Column({ nullable: true })
  startsAt: Date;

  @Column({ nullable: true })
  endsAt: Date;

  @Column({ length: 20, default: 'ACTIVE' })
  status: string;

  @Column({ nullable: true })
  revokedAt: Date;

  @Column({ nullable: true })
  revokedBy: number;

  @Column({ length: 255, nullable: true })
  reason: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId' })
  role: Role;
}
