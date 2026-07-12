import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Member } from '../../members/entities/member.entity';
import { Session } from './session.entity';
import { UserRole } from '../../roles/user-role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 10 })
  npk: string;

  @Column()
  password: string;

  @Column({ default: false })
  mustChangePassword: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ nullable: true })
  lockedUntil: Date;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  memberId: number;

  @OneToOne(() => Member, (member) => member.user)
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
