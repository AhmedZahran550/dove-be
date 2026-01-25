import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { WorkOrderStatus } from './work-order-status.entity';
import { UserProfile } from './user-profile.entity';

@Entity('conditional_status_rules')
export class ConditionalStatusRule extends BaseEntity {
  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'varchar', length: 255 })
  rule_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'uuid', nullable: true })
  status_id: string;

  @Column({ type: 'varchar', length: 255 })
  status_name: string;

  @Column({ type: 'jsonb' })
  conditions: Record<string, any>;

  @Column({ type: 'jsonb', default: [] })
  actions: Record<string, any>[];

  @Column({ type: 'boolean', default: true })
  run_on_import: boolean;

  @Column({ type: 'boolean', default: true })
  run_on_update: boolean;

  @Column({ type: 'boolean', default: false })
  run_on_schedule: boolean;

  @Column({ type: 'varchar', nullable: true })
  schedule_cron: string;

  @Column({ type: 'timestamptz', nullable: true })
  last_executed_at: Date;

  @Column({ type: 'int', default: 0 })
  execution_count: number;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => WorkOrderStatus)
  @JoinColumn({ name: 'status_id' })
  status: WorkOrderStatus;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  createdByUser: UserProfile;
}
