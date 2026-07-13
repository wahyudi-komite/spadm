import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MemberImport } from './member-import.entity';

@Entity('member_import_rows')
export class MemberImportRow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  importId: number;

  @ManyToOne(() => MemberImport, (memberImport) => memberImport.rows, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'importId' })
  memberImport: MemberImport;

  @Column()
  rowNumber: number;

  @Column({ length: 10, nullable: true })
  npk: string;

  @Column({ type: 'json' })
  rawData: Record<string, unknown>;

  @Column({ type: 'json' })
  normalizedData: Record<string, string>;

  @Column({ default: false })
  isValid: boolean;

  @Column({ length: 20 })
  action: string;

  @Column({ type: 'json', nullable: true })
  errors: string[];

  @Column({ nullable: true })
  processedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
