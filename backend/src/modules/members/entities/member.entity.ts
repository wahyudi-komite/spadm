import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, OneToMany } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

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

  @OneToOne(() => User, (user) => user.member)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
