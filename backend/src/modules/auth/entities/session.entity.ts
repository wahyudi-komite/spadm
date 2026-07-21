import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Member } from '../../members/entities/member.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  memberId: number;

  @ManyToOne(() => Member, (member) => member.sessions)
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @Column({ length: 500 })
  refreshToken: string;

  @Column({ length: 45, nullable: true })
  ipAddress: string;

  @Column({ length: 255, nullable: true })
  userAgent: string;

  @Column()
  expiresAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
