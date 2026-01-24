import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { WorkOrder } from './work-order.entity';
import { UserProfile } from './user-profile.entity';

@Entity('work_order_status_history')
export class WorkOrderStatusHistory extends BaseEntity {
  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'uuid' })
  work_order_id: string;

  @Column({ type: 'varchar', nullable: true })
  old_status: string;

  @Column({ type: 'varchar' })
  new_status: string;

  @Column({ type: 'varchar' })
  status_type: string;

  @Column({ type: 'uuid', nullable: true })
  condition_rule_id: string;

  @Column({ type: 'varchar', nullable: true })
  condition_rule_name: string;

  @Column({ type: 'jsonb', nullable: true })
  matched_conditions: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  changed_by: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  changed_at: Date;

  @Column({ type: 'text', nullable: true })
  change_reason: string;

  @Column({ type: 'varchar', nullable: true })
  change_source: string;

  @Column({ type: 'jsonb', nullable: true })
  work_order_state: Record<string, any>;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => WorkOrder)
  @JoinColumn({ name: 'work_order_id' })
  workOrder: WorkOrder;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'changed_by' })
  changedBy: UserProfile;
}
