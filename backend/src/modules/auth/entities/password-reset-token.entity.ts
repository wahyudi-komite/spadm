import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  memberId: number;

  @Column({ length: 255 })
  token: string;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  isUsed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
