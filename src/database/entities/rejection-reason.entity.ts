import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { RejectionCategory } from './rejection-category.entity';
import { QCRejection } from './qc-rejection.entity';

@Entity('rejection_reasons')
@Index(['companyId'])
@Index(['departmentId'])
@Index(['categoryId'])
@Index(['isActive'])
export class RejectionReason extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid', nullable: true })
  departmentId?: string;

  @Column({ type: 'uuid' })
  categoryId: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false })
  requiresPhoto: boolean;

  @Column({ type: 'boolean', default: false })
  requiresComment: boolean;

  @Column({ type: 'boolean', default: false })
  requiresApproval: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  defaultAction?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  displayOrder: number;

  // Relations
  @ManyToOne(() => Company, (company) => company.rejectionReasons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @ManyToOne(() => RejectionCategory, (category) => category.rejectionReasons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category?: RejectionCategory;

  @OneToMany(() => QCRejection, (rejection) => rejection.rejectionReason)
  qcRejections?: QCRejection[];
}
