import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { ScheduleFile } from './schedule-file.entity';
import { WorkOrder } from './work-order.entity';

@Entity('schedule_data')
@Unique(['companyId', 'woId'])
@Index(['companyId'])
@Index(['woId'])
@Index(['department'])
@Index(['status'])
@Index(['scheduleFileId'])
@Index(['importBatchId'])
export class ScheduleData extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid', nullable: true })
  scheduleFileId?: string;

  // Work Order Information
  @Column({ type: 'varchar', length: 100 })
  woId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  woNumber?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  releaseDate?: string;

  @Column({ type: 'integer', default: 0 })
  sequence: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  dueDate?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  status?: string;

  // Product Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  partNumber?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department?: string;

  @Column({ type: 'integer', default: 0 })
  qtyOpen: number;

  // Production Information
  @Column({ type: 'varchar', length: 100, nullable: true })
  prodDate?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bulkLot?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  prodQty?: string;

  // Inspection Information
  @Column({ type: 'integer', default: 0 })
  inspQty: number;

  @Column({ type: 'integer', default: 0 })
  rejected: number;

  // Additional Information
  @Column({ type: 'varchar', length: 50, nullable: true })
  shift?: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  rawData?: any;

  @Column({ type: 'varchar', length: 100, nullable: true })
  importBatchId?: string;

  @Column({ type: 'boolean', default: false })
  isSynced: boolean;

  @Column({ type: 'uuid', nullable: true })
  syncedWorkOrderId?: string;

  // Relations
  @ManyToOne(() => Company, (company) => company.scheduleData, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @ManyToOne(() => ScheduleFile, (file) => file.scheduleData, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'scheduleFileId' })
  scheduleFile?: ScheduleFile;

  @ManyToOne(() => WorkOrder, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'syncedWorkOrderId' })
  syncedWorkOrder?: WorkOrder;
}
