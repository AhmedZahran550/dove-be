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
@Index(['companyId'])
@Index(['departmentId'])
@Index(['isActive'])
export class RejectionCategory extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid', nullable: true })
  departmentId?: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color?: string;

  @Column({ type: 'boolean', default: false })
  requiresRework: boolean;

  @Column({ type: 'boolean', default: false })
  requiresScrap: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  displayOrder: number;

  // Relations
  @ManyToOne(() => Company, (company) => company.rejectionCategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @OneToMany(() => RejectionReason, (reason) => reason.category)
  rejectionReasons?: RejectionReason[];
}
