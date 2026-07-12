import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { DistributionArea } from './distribution-area.entity';

@Entity('organizational_unit_area_mappings')
export class OrganizationalUnitAreaMapping {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  plant: string;

  @Column({ name: 'work_unit', type: 'varchar', length: 100 })
  workUnit: string;

  @Column({ name: 'distribution_area_id' })
  distributionAreaId: number;

  @ManyToOne(() => DistributionArea, area => area.mappings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'distribution_area_id' })
  distributionArea: DistributionArea;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
