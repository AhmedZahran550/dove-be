import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { WorkOrder } from './work-order.entity';
import { DowntimeReason } from './downtime-reason.entity';
import { UserProfile } from './user-profile.entity';

@Entity('work_order_downtime')
export class WorkOrderDowntime extends BaseEntity {
  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'uuid' })
  work_order_id: string;

  @Column({ type: 'uuid', nullable: true })
  downtime_reason_id: string;

  @Column({ type: 'timestamptz' })
  start_time: Date;

  @Column({ type: 'timestamptz', nullable: true })
  end_time: Date;

  @Column({ type: 'int', nullable: true })
  duration_minutes: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: true })
  operator_id: string;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => WorkOrder)
  @JoinColumn({ name: 'work_order_id' })
  workOrder: WorkOrder;

  @ManyToOne(() => DowntimeReason)
  @JoinColumn({ name: 'downtime_reason_id' })
  downtimeReason: DowntimeReason;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'operator_id' })
  operator: UserProfile;
}
