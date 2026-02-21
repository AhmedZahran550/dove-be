import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { ScheduleData } from './schedule-data.entity';
import { Operator } from './operator.entity';
import { Shift } from './shift.entity';
import { ProcessStep } from './process-step.entity';
import { User } from './user.entity';

@Entity('schedule_operator_assignments')
export class ScheduleOperatorAssignment extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  scheduleDataId: string;

  @Column({ type: 'uuid', nullable: true })
  operatorId: string;

  @Column({ type: 'uuid', nullable: true })
  shiftId: string;

  @Column({ type: 'uuid', nullable: true })
  processStepId: string;

  @Column({ type: 'varchar', default: 'scheduled' })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  assignedBy: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamptz', nullable: true })
  scheduledStartTime: Date;

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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_by' })
  assignedByUser: User;
}
