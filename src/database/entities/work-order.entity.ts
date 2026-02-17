import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { Location } from './location.entity';
import { WorkOrderStatus } from './work-order-status.entity';
import { UserProfile } from './user-profile.entity';
import { TimeSegment } from './time-segment.entity';
import { QCRejection } from './qc-rejection.entity';
import { WorkOrderOperator } from './work-order-operator.entity';
import { ScheduleData } from './schedule-data.entity';

@Entity('work_order')
@Unique(['companyId', 'woNumber'])
@Index(['companyId'])
@Index(['locationId'])
@Index(['departmentId'])
@Index(['statusId'])
@Index(['currentStatus'])
@Index(['woNumber'])
@Index(['productId'])
@Index(['startTime'])
@Index(['closingTime'])
export class WorkOrder extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  locationId: string;

  @Column({ type: 'uuid', nullable: true })
  departmentId?: string;

  @Column({ type: 'varchar', length: 50 })
  woNumber: string;

  @Column({ type: 'integer' })
  woQty: number;

  @Column({ type: 'uuid', nullable: true })
  productId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lotNumber?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bulkLotNumber?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pailSerial?: string;

  @Column({ type: 'timestamptz', nullable: true })
  bulkAStart?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  bulkAEnd?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  bulkBStart?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  bulkBEnd?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  startTime?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  closingTime?: Date;

  @Column({ type: 'integer', default: 0 })
  setupTime: number;

  @Column({ type: 'text', nullable: true })
  setupComment?: string;

  @Column({ type: 'integer', default: 0 })
  qtyCompleted: number;

  @Column({ type: 'integer', default: 0 })
  qtyRejected: number;

  @Column({ type: 'timestamptz', nullable: true })
  inspectionStartTime?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  inspectionEndTime?: Date;

  @Column({ type: 'uuid', nullable: true })
  equipmentId?: string;

  @Column({ type: 'boolean', default: false })
  manualRun: boolean;

  @Column({ type: 'integer', default: 0 })
  downTime: number;

  @Column({ type: 'integer', default: 0 })
  breakTime: number;

  @Column({ type: 'uuid', nullable: true })
  statusId?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  availability?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  performance?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  quality?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  oee?: number;

  @Column({ type: 'integer', nullable: true })
  runTime?: number;

  @Column({ type: 'integer', nullable: true })
  uptime?: number;

  @Column({ type: 'text', nullable: true })
  operatorComment?: string;

  @Column({ type: 'text', nullable: true })
  leadHandComment?: string;

  @Column({ type: 'text', nullable: true })
  supervisorComment?: string;

  @Column({ type: 'uuid', nullable: true })
  shiftId?: string;

  @Column({ type: 'varchar', length: 50, default: 'Waiting' })
  currentStatus: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  statusUpdatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  statusUpdatedBy?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  availabilityGoal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  performanceGoal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  qualityGoal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  oeeGoal: number;

  @Column({ type: 'date', nullable: true })
  releaseDate: Date;

  // Relations
  @ManyToOne(() => Company, (company) => company.workOrders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @ManyToOne(() => Location, (location) => location.workOrders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'locationId' })
  location?: Location;

  @ManyToOne(() => WorkOrderStatus, (status) => status.workOrders)
  @JoinColumn({ name: 'statusId' })
  status?: WorkOrderStatus;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'statusUpdatedBy' })
  statusUpdatedByUser?: UserProfile;

  @OneToMany(() => TimeSegment, (segment) => segment.workOrder)
  timeSegments?: TimeSegment[];

  @OneToMany(() => QCRejection, (rejection) => rejection.workOrder)
  qcRejections?: QCRejection[];

  @OneToMany(() => WorkOrderOperator, (wo) => wo.workOrder)
  workOrderOperators?: WorkOrderOperator[];

  @OneToOne(() => ScheduleData, { cascade: ['insert', 'update'] })
  @JoinColumn({ name: 'schedule_row_id' })
  scheduleRow?: ScheduleData;

  @Column({ type: 'uuid', nullable: false })
  scheduleRowId: string;
}
