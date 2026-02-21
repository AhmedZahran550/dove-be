import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { WorkOrder } from './work-order.entity';
import { User } from './user.entity';

@Entity('work_order_status_history')
export class WorkOrderStatusHistory extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  workOrderId: string;

  @Column({ type: 'varchar', nullable: true })
  oldStatus: string;

  @Column({ type: 'varchar' })
  newStatus: string;

  @Column({ type: 'varchar' })
  statusType: string;

  @Column({ type: 'uuid', nullable: true })
  conditionRuleId: string;

  @Column({ type: 'varchar', nullable: true })
  conditionRuleName: string;

  @Column({ type: 'jsonb', nullable: true })
  matchedConditions: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  changedBy: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  changedAt: Date;

  @Column({ type: 'text', nullable: true })
  changeReason: string;

  @Column({ type: 'varchar', nullable: true })
  changeSource: string;

  @Column({ type: 'jsonb', nullable: true })
  workOrderState: Record<string, any>;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => WorkOrder)
  @JoinColumn({ name: 'work_order_id' })
  workOrder: WorkOrder;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by' })
  changedByUser: User;
}
