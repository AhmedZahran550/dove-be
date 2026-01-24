import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { ScheduleData } from './schedule-data.entity';
import { Operator } from './operator.entity';
import { Shift } from './shift.entity';
import { ProcessStep } from './process-step.entity';
import { UserProfile } from './user-profile.entity';

@Entity('schedule_operator_assignments')
export class ScheduleOperatorAssignment extends BaseEntity {
  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'uuid' })
  schedule_data_id: string;

  @Column({ type: 'uuid', nullable: true })
  operator_id: string;

  @Column({ type: 'uuid', nullable: true })
  shift_id: string;

  @Column({ type: 'uuid', nullable: true })
  process_step_id: string;

  @Column({ type: 'varchar', default: 'scheduled' })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  assigned_by: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  assigned_at: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamptz', nullable: true })
  scheduled_start_time: Date;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => ScheduleData)
  @JoinColumn({ name: 'schedule_data_id' })
  scheduleData: ScheduleData;

  @ManyToOne(() => Operator)
  @JoinColumn({ name: 'operator_id' })
  operator: Operator;

  @ManyToOne(() => Shift)
  @JoinColumn({ name: 'shift_id' })
  shift: Shift;

  @ManyToOne(() => ProcessStep)
  @JoinColumn({ name: 'process_step_id' })
  processStep: ProcessStep;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'assigned_by' })
  assignedBy: UserProfile;
}
