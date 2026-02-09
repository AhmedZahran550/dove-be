import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { Department } from './department.entity';
import { UserProfile } from './user-profile.entity';

@Entity('department_oee_settings')
export class DepartmentOeeSetting extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  departmentId: string;

  @Column({ type: 'boolean', default: true })
  qcRequired: boolean;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 85.0 })
  availabilityGoal: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 90.0 })
  performanceGoal: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 95.0 })
  qualityGoal: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 72.67 })
  oeeGoal: number;

  @Column({ type: 'date' })
  effectiveFrom: Date;

  @Column({ type: 'date', nullable: true })
  effectiveTo: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  createdByUser: UserProfile;
}
