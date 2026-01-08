import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { Location } from './location.entity';
import { User } from './user.entity';

@Entity('work_orders')
@Unique(['company_id', 'wo_number'])
@Index('idx_work_orders_company_id', ['company_id'])
@Index('idx_work_orders_location_id', ['location_id'])
@Index('idx_work_orders_current_status', ['current_status'])
export class WorkOrder extends BaseEntity {
  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'uuid' })
  location_id: string;

  @Column({ type: 'uuid', nullable: true })
  department_id: string;

  @Column({ length: 50 })
  wo_number: string;

  @Column({ type: 'int' })
  wo_qty: number;

  @Column({ type: 'uuid', nullable: true })
  product_id: string;

  @Column({ length: 100, nullable: true })
  lot_number: string;

  @Column({ length: 100, nullable: true })
  bulk_lot_number: string;

  @Column({ length: 100, nullable: true })
  pail_serial: string;

  @Column({ type: 'timestamptz', nullable: true })
  bulk_a_start: Date;

  @Column({ type: 'timestamptz', nullable: true })
  bulk_a_end: Date;

  @Column({ type: 'timestamptz', nullable: true })
  bulk_b_start: Date;

  @Column({ type: 'timestamptz', nullable: true })
  bulk_b_end: Date;

  @Column({ type: 'timestamptz', nullable: true })
  start_time: Date;

  @Column({ type: 'timestamptz', nullable: true })
  closing_time: Date;

  @Column({ type: 'int', default: 0 })
  setup_time: number;

  @Column({ type: 'text', nullable: true })
  setup_comment: string;

  @Column({ type: 'int', default: 0 })
  qty_completed: number;

  @Column({ type: 'int', default: 0 })
  qty_rejected: number;

  @Column({ type: 'timestamptz', nullable: true })
  inspection_start_time: Date;

  @Column({ type: 'timestamptz', nullable: true })
  inspection_end_time: Date;

  @Column({ type: 'uuid', nullable: true })
  equipment_id: string;

  @Column({ default: false })
  manual_run: boolean;

  @Column({ type: 'int', default: 0 })
  down_time: number;

  @Column({ type: 'int', default: 0 })
  break_time: number;

  @Column({ type: 'uuid', nullable: true })
  status_id: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  availability: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  performance: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  quality: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  oee: number;

  @Column({ type: 'int', nullable: true })
  run_time: number;

  @Column({ type: 'int', nullable: true })
  uptime: number;

  @Column({ type: 'text', nullable: true })
  operator_comment: string;

  @Column({ type: 'text', nullable: true })
  lead_hand_comment: string;

  @Column({ type: 'text', nullable: true })
  supervisor_comment: string;

  @Column({ type: 'uuid', nullable: true })
  shift_id: string;

  @Column({ length: 50, default: 'Waiting' })
  current_status: string;

  @Column({ type: 'timestamptz', nullable: true })
  status_updated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  status_updated_by: string;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'status_updated_by' })
  statusUpdatedBy: User;
}
