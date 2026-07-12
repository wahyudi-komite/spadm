import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Role } from './role.entity';

@Entity('user_role_histories')
export class UserRoleHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  roleId: number;

  @Column({ nullable: true })
  areaId: number;

  @Column({ type: 'enum', enum: ['ASSIGN', 'REVOKE'] })
  action: 'ASSIGN' | 'REVOKE';

  @Column()
  changedBy: number;

  @Column({ length: 255, nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId' })
  role: Role;
}
