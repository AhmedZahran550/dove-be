import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { Department } from './department.entity';
import { UserProfile } from './user-profile.entity';

@Entity('department_oee_settings')
export class DepartmentOeeSetting extends BaseEntity {
  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'uuid' })
  department_id: string;

  @Column({ type: 'boolean', default: true })
  qc_required: boolean;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 85.0 })
  availability_goal: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 90.0 })
  performance_goal: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 95.0 })
  quality_goal: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 72.67 })
  oee_goal: number;

  @Column({ type: 'date' })
  effective_from: Date;

  @Column({ type: 'date', nullable: true })
  effective_to: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false })
  is_archived: boolean;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'created_by' })
  createdByUser: UserProfile;
}
