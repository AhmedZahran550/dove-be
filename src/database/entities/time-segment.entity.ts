import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { WorkOrder } from './work-order.entity';
import { User } from './user.entity';

@Entity('time_segments')
@Index(['companyId'])
@Index(['workOrderId'])
@Index(['operatorId'])
@Index(['startTime'])
@Index(['shiftDate'])
@Index(['isActive'])
export class TimeSegment extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  workOrderId: string;

  @Column({ type: 'uuid' })
  operatorId: string;

  @Column({ type: 'uuid', nullable: true })
  operatorAssId?: string;

  @Column({ type: 'timestamptz' })
  startTime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endTime?: Date;

  @Column({ type: 'integer', nullable: true })
  durationMinutes?: number;

  @Column({ type: 'uuid', nullable: true })
  shiftId?: string;

  @Column({ type: 'date', nullable: true })
  shiftDate?: Date;

  @Column({ type: 'varchar', length: 50, default: 'productive' })
  segmentType: string;

  @Column({ type: 'uuid', nullable: true })
  downtimeReasonId?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  downtimeCategory?: string;

  @Column({ type: 'text', nullable: true })
  downtimeNotes?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  breakType?: string;

  @Column({ type: 'integer', default: 0 })
  qtyProduced: number;

  @Column({ type: 'integer', default: 0 })
  qtyRejected: number;

  @Column({ type: 'uuid', nullable: true })
  equipmentId?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isApproved: boolean;

  @Column({ type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relations
  @ManyToOne(() => Company, (company) => company.timeSegments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @ManyToOne(() => WorkOrder, (workOrder) => workOrder.timeSegments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workOrderId' })
  workOrder?: WorkOrder;

  @ManyToOne(() => User, (user) => user.timeSegments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'operatorId' })
  operator?: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'operatorAssId' })
  operatorAssistant?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approvedBy' })
  approver?: User;
}
