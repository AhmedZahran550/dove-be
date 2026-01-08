import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { ScheduleFile } from './schedule-file.entity';
import { WorkOrder } from './work-order.entity';

@Entity('schedule_data')
@Unique(['company_id', 'wo_id'])
@Index('idx_schedule_data_company_id', ['company_id'])
@Index('idx_schedule_data_wo_id', ['wo_id'])
@Index('idx_schedule_data_department', ['department'])
@Index('idx_schedule_data_status', ['status'])
export class ScheduleData extends BaseEntity {
  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'uuid', nullable: true })
  schedule_file_id: string;

  @Column({ length: 100 })
  wo_id: string;

  @Column({ length: 100, nullable: true })
  wo_number: string;

  @Column({ length: 100, nullable: true })
  release_date: string;

  @Column({ type: 'int', default: 0 })
  sequence: number;

  @Column({ length: 100, nullable: true })
  due_date: string;

  @Column({ length: 100, nullable: true })
  status: string;

  @Column({ length: 255, nullable: true })
  part_number: string;

  @Column({ length: 100, nullable: true })
  department: string;

  @Column({ type: 'int', default: 0 })
  qty_open: number;

  @Column({ length: 100, nullable: true })
  prod_date: string;

  @Column({ length: 100, nullable: true })
  bulk_lot: string;

  @Column({ length: 100, nullable: true })
  prod_qty: string;

  @Column({ type: 'int', default: 0 })
  insp_qty: number;

  @Column({ type: 'int', default: 0 })
  rejected: number;

  @Column({ length: 50, nullable: true })
  shift: string;

  @Column({ type: 'jsonb', nullable: true })
  raw_data: Record<string, any>;

  @Column({ length: 100, nullable: true })
  import_batch_id: string;

  @Column({ default: false })
  is_synced: boolean;

  @Column({ type: 'uuid', nullable: true })
  synced_work_order_id: string;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => ScheduleFile, (file) => file.scheduleDataEntries, {
    nullable: true,
  })
  @JoinColumn({ name: 'schedule_file_id' })
  scheduleFile: ScheduleFile;

  @ManyToOne(() => WorkOrder, { nullable: true })
  @JoinColumn({ name: 'synced_work_order_id' })
  syncedWorkOrder: WorkOrder;
}
