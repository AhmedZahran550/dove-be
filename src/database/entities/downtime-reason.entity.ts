import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { Department } from './department.entity';
import { DowntimeCategory } from './downtime-category.entity';

@Entity('downtime_reasons')
export class DowntimeReason extends BaseEntity {
  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'uuid' })
  category_id: string;

  @Column({ type: 'text' })
  reason_text: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'uuid', nullable: true })
  department_id: string;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => DowntimeCategory, (category) => category.reasons)
  @JoinColumn({ name: 'category_id' })
  category: DowntimeCategory;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;
}
