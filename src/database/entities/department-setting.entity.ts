import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { Department } from './department.entity';

@Entity('department_settings')
@Index('idx_department_settings_company_id', ['company_id'])
@Index('idx_department_settings_department_id', ['department_id'])
export class DepartmentSetting extends BaseEntity {
  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'uuid' })
  department_id: string;

  @Column({ length: 255, nullable: true })
  department_name: string;

  @Column({ length: 255, nullable: true })
  display_name: string;

  @Column({ length: 100, nullable: true })
  filter_table: string;

  @Column({ length: 100, nullable: true })
  filter_column: string;

  @Column({ length: 50, nullable: true })
  filter_operator: string;

  @Column({ type: 'text', nullable: true })
  filter_value: string;

  @Column({ type: 'text', nullable: true })
  filter_rules: string;

  @Column({ type: 'text', nullable: true })
  exclusion_rules: string;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'boolean', default: false })
  enable_process_steps: boolean;

  @Column({ default: true })
  is_active: boolean;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Department, (department) => department.department_settings)
  @JoinColumn({ name: 'department_id' })
  department: Department;
}
