import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { Department } from './department.entity';

@Entity('process_steps')
export class ProcessStep extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid', nullable: true })
  departmentId: string;

  @Column({ type: 'varchar', length: 255 })
  stepName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  stepCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  sequence: number;

  @Column({ type: 'jsonb', default: {} })
  attributes: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  isRequired: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', default: 'required' })
  stepType: string;

  @Column({ type: 'boolean', default: true })
  oeeEnabled: boolean;

  @Column({ type: 'boolean', default: true })
  downtimeEnabled: boolean;

  @Column({ type: 'boolean', default: true })
  qtyRequiredOnClose: boolean;

  @Column({ type: 'boolean', default: false })
  isLastStep: boolean;

  @Column({ type: 'boolean', default: false })
  isPrimaryProductionStep: boolean;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;
}
