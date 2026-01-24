import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { Department } from './department.entity';
import { DowntimeReason } from './downtime-reason.entity';

@Entity('downtime_categories')
export class DowntimeCategory extends BaseEntity {
  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  department_id: string;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => DowntimeReason, (reason) => reason.category)
  reasons: DowntimeReason[];
}
