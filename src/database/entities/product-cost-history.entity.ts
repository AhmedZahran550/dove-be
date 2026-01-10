import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { PartnumberInfo } from './partnumber-info.entity';
import { UserProfile } from './user-profile.entity';

@Entity('product_cost_history')
@Index(['productId'])
@Index(['companyId'])
export class ProductCostHistory extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'varchar', length: 20 })
  costType: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  costAmount: number;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason?: string;

  @Column({ type: 'uuid', nullable: true })
  changedBy?: string;

  // Relations
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @ManyToOne(() => PartnumberInfo, (product) => product.costHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product?: PartnumberInfo;

  @ManyToOne(() => UserProfile, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'changedBy' })
  changedByUser?: UserProfile;
}
