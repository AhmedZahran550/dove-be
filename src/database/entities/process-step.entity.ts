import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { Department } from './department.entity';

@Entity('process_steps')
export class ProcessStep extends BaseEntity {
  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'uuid', nullable: true })
  department_id: string;

  @Column({ type: 'varchar', length: 255 })
  step_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  step_code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  display_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  sequence: number;

  @Column({ type: 'jsonb', default: {} })
  attributes: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  is_required: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'varchar', default: 'required' })
  step_type: string;

  @Column({ type: 'boolean', default: true })
  oee_enabled: boolean;

  @Column({ type: 'boolean', default: true })
  downtime_enabled: boolean;

  @Column({ type: 'boolean', default: true })
  qty_required_on_close: boolean;

  @Column({ type: 'boolean', default: false })
  is_last_step: boolean;

  @Column({ type: 'boolean', default: false })
  is_primary_production_step: boolean;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;
}
