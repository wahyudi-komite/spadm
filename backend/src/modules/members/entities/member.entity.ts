import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Session } from '../../auth/entities/session.entity';
import { UserRole } from '../../roles/user-role.entity';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 10 })
  npk: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 50, nullable: true })
  workUnit: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 20, default: 'active' })
  status: string;

  @Column({ length: 100, nullable: true })
  organizationalPosition: string;

  @Column({ length: 10, nullable: true })
  plant: string;

  @Column({ nullable: true })
  distributionAreaId: number;

  @Column({ nullable: true })
  password?: string;

  @Column({ default: false })
  mustChangePassword: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ nullable: true })
  lockedUntil?: Date;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @OneToMany(() => Session, (session) => session.member)
  sessions: Session[];

  @OneToMany(() => UserRole, (userRole) => userRole.member)
  userRoles: UserRole[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
