import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MemberImportRow } from './member-import-row.entity';

@Entity('member_imports')
export class MemberImport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  fileName: string;

  @Column({ length: 30, default: 'PREVIEW' })
  status: string;

  @Column()
  uploadedBy: number;

  @Column({ nullable: true })
  confirmedBy: number;

  @Column({ nullable: true })
  confirmedAt: Date;

  @Column({ default: 0 })
  totalRows: number;

  @Column({ default: 0 })
  validRows: number;

  @Column({ default: 0 })
  invalidRows: number;

  @Column({ default: 0 })
  createdCount: number;

  @Column({ default: 0 })
  updatedCount: number;

  @Column({ default: 0 })
  errorCount: number;

  @OneToMany(() => MemberImportRow, (row) => row.memberImport)
  rows: MemberImportRow[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
