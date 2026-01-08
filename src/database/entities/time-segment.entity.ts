import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { WorkOrder } from './work-order.entity';
import { User } from './user.entity';

@Entity('time_segments')
@Index('idx_time_segments_company_id', ['company_id'])
@Index('idx_time_segments_work_order_id', ['work_order_id'])
@Index('idx_time_segments_operator_id', ['operator_id'])
@Index('idx_time_segments_start_time', ['start_time'])
@Index('idx_time_segments_is_active', ['is_active'])
export class TimeSegment extends BaseEntity {
  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'uuid' })
  work_order_id: string;

  @Column({ type: 'uuid' })
  operator_id: string;

  @Column({ type: 'uuid', nullable: true })
  operator_ass_id: string;

  @Column({ type: 'timestamptz' })
  start_time: Date;

  @Column({ type: 'timestamptz', nullable: true })
  end_time: Date;

  @Column({ type: 'int', nullable: true })
  duration_minutes: number;

  @Column({ type: 'uuid', nullable: true })
  shift_id: string;

  @Column({ type: 'date', nullable: true })
  shift_date: string;

  @Column({ length: 50, default: 'productive' })
  segment_type: string;

  @Column({ type: 'uuid', nullable: true })
  downtime_reason_id: string;

  @Column({ length: 50, nullable: true })
  downtime_category: string;

  @Column({ type: 'text', nullable: true })
  downtime_notes: string;

  @Column({ length: 50, nullable: true })
  break_type: string;

  @Column({ type: 'int', default: 0 })
  qty_produced: number;

  @Column({ type: 'int', default: 0 })
  qty_rejected: number;

  @Column({ type: 'uuid', nullable: true })
  equipment_id: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_approved: boolean;

  @Column({ type: 'uuid', nullable: true })
  approved_by: string;

  @Column({ type: 'timestamptz', nullable: true })
  approved_at: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => WorkOrder)
  @JoinColumn({ name: 'work_order_id' })
  workOrder: WorkOrder;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'operator_id' })
  operator: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'operator_ass_id' })
  operatorAssistant: User;
}
