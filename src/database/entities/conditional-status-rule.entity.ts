import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { WorkOrderStatus } from './work-order-status.entity';
import { UserProfile } from './user-profile.entity';

@Entity('conditional_status_rules')
export class ConditionalStatusRule extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  ruleName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'uuid', nullable: true })
  statusId: string;

  @Column({ type: 'varchar', length: 255 })
  statusName: string;

  @Column({ type: 'jsonb' })
  conditions: Record<string, any>;

  @Column({ type: 'jsonb', default: [] })
  actions: Record<string, any>[];

  @Column({ type: 'boolean', default: true })
  runOnImport: boolean;

  @Column({ type: 'boolean', default: true })
  runOnUpdate: boolean;

  @Column({ type: 'boolean', default: false })
  runOnSchedule: boolean;

  @Column({ type: 'varchar', nullable: true })
  scheduleCron: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastExecutedAt: Date;

  @Column({ type: 'int', default: 0 })
  executionCount: number;

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
