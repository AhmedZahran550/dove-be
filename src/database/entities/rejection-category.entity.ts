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
import { RejectionReason } from './rejection-reason.entity';

@Entity('rejection_categories')
@Index('idx_rejection_categories_company_id', ['company_id'])
@Index('idx_rejection_categories_is_active', ['is_active'])
export class RejectionCategory extends BaseEntity {
  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'uuid', nullable: true })
  department_id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 7, nullable: true })
  color: string;

  @Column({ default: false })
  requires_rework: boolean;

  @Column({ default: false })
  requires_scrap: boolean;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => RejectionReason, (reason) => reason.category)
  reasons: RejectionReason[];
}
