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
@Index('idx_departments_company_id', ['companyId'])
export class Department extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ length: 255 })
  departmentName: string;

  @Column({ length: 50, nullable: true })
  departmentCode: string;

  @Column({ length: 255, nullable: true })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => DepartmentSetting, (setting) => setting.department)
  departmentSettings: DepartmentSetting[];
}
