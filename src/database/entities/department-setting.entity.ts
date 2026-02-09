import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { Department } from './department.entity';

@Entity('department_settings')
@Index('idx_department_settings_company_id', ['companyId'])
@Index('idx_department_settings_department_id', ['departmentId'])
export class DepartmentSetting extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  departmentId: string;

  @Column({ length: 255, nullable: true })
  departmentName: string;

  @Column({ length: 255, nullable: true })
  displayName: string;

  @Column({ length: 100, nullable: true })
  filterTable: string;

  @Column({ length: 100, nullable: true })
  filterColumn: string;

  @Column({ length: 50, nullable: true })
  filterOperator: string;

  @Column({ type: 'text', nullable: true })
  filterValue: string;

  @Column({ type: 'text', nullable: true })
  filterRules: string;

  @Column({ type: 'text', nullable: true })
  exclusionRules: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: false })
  enableProcessSteps: boolean;

  @Column({ default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Department, (department) => department.departmentSettings)
  @JoinColumn({ name: 'department_id' })
  department: Department;
}
