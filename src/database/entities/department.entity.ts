import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { DepartmentSetting } from './department-setting.entity';

@Entity('departments')
@Index('idx_departments_company_id', ['company_id'])
export class Department extends BaseEntity {
  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ length: 255 })
  department_name: string;

  @Column({ length: 50, nullable: true })
  department_code: string;

  @Column({ length: 255, nullable: true })
  display_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ default: true })
  is_active: boolean;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => DepartmentSetting, (setting) => setting.department)
  department_settings: DepartmentSetting[];
}
