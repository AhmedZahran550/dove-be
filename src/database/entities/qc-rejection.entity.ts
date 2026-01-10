import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { WorkOrder } from './work-order.entity';
import { RejectionReason } from './rejection-reason.entity';
import { UserProfile } from './user-profile.entity';

@Entity('qc_rejections')
@Index(['companyId'])
@Index(['workOrderId'])
@Index(['rejectionReasonId'])
@Index(['inspectionDate'])
@Index(['severity'])
@Index(['processStepId'])
@Index(['operatorId'])
@Index(['shift'])
@Index(['rootCauseCategory'])
export class QCRejection extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  workOrderId: string;

  @Column({ type: 'uuid' })
  rejectionReasonId: string;

  @Column({ type: 'integer' })
  quantityRejected: number;

  @Column({ type: 'uuid', nullable: true })
  inspectorId?: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  inspectionDate: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  photos?: any;

  @Column({ type: 'varchar', length: 20, nullable: true })
  actionTaken?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  reworkWoNumber?: string;

  @Column({ type: 'text', nullable: true })
  resolutionNotes?: string;

  @Column({ type: 'uuid', nullable: true })
  resolvedBy?: string;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt?: Date;

  // Enhanced fields for Phase 1
  @Column({ type: 'varchar', length: 20, default: 'major' })
  severity: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCostImpact?: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  costCurrency: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  laborHoursRework?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  materialCostScrapped?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  rootCauseCategory?: string;

  @Column({ type: 'text', nullable: true })
  rootCauseDetails?: string;

  @Column({ type: 'text', nullable: true })
  correctiveAction?: string;

  @Column({ type: 'text', nullable: true })
  preventiveAction?: string;

  @Column({ type: 'uuid', nullable: true })
  processStepId?: string;

  @Column({ type: 'uuid', nullable: true })
  equipmentId?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  shift?: string;

  @Column({ type: 'uuid', nullable: true })
  operatorId?: string;

  @Column({ type: 'boolean', default: false })
  customerComplaintRelated: boolean;

  @Column({ type: 'uuid', nullable: true })
  customerId?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  rmaNumber?: string;

  @Column({ type: 'uuid', nullable: true })
  dispositionApprovedBy?: string;

  @Column({ type: 'timestamptz', nullable: true })
  dispositionApprovedAt?: Date;

  @Column({ type: 'text', nullable: true })
  dispositionNotes?: string;

  @Column({ type: 'jsonb', default: '{}' })
  attributes: any;

  // Relations
  @ManyToOne(() => Company, (company) => company.qcRejections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @ManyToOne(() => WorkOrder, (wo) => wo.qcRejections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workOrderId' })
  workOrder?: WorkOrder;

  @ManyToOne(() => RejectionReason, (reason) => reason.qcRejections, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'rejectionReasonId' })
  rejectionReason?: RejectionReason;

  @ManyToOne(() => UserProfile, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'inspectorId' })
  inspector?: UserProfile;

  @ManyToOne(() => UserProfile, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'resolvedBy' })
  resolver?: UserProfile;

  @ManyToOne(() => UserProfile, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'operatorId' })
  operator?: UserProfile;

  @ManyToOne(() => UserProfile, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'dispositionApprovedBy' })
  dispositionApprover?: UserProfile;
}
