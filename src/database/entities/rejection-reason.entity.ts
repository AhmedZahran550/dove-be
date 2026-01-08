import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { RejectionCategory } from './rejection-category.entity';

@Entity('rejection_reasons')
@Index('idx_rejection_reasons_company_id', ['company_id'])
@Index('idx_rejection_reasons_category_id', ['category_id'])
@Index('idx_rejection_reasons_is_active', ['is_active'])
export class RejectionReason extends BaseEntity {
  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'uuid', nullable: true })
  department_id: string;

  @Column({ type: 'uuid' })
  category_id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 50 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  requires_photo: boolean;

  @Column({ default: false })
  requires_comment: boolean;

  @Column({ default: false })
  requires_approval: boolean;

  @Column({ length: 20, nullable: true })
  default_action: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => RejectionCategory, (category) => category.reasons)
  @JoinColumn({ name: 'category_id' })
  category: RejectionCategory;
}
