import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('login_histories')
export class LoginHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  memberId: number;

  @Column({ length: 45, nullable: true })
  ipAddress: string;

  @Column({ length: 255, nullable: true })
  userAgent: string;

  @Column({ default: false })
  isSuccess: boolean;

  @Column({ length: 255, nullable: true })
  failureReason: string;

  @CreateDateColumn()
  createdAt: Date;
}
