import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { PartnumberInfo } from './partnumber-info.entity';

@Entity('product_pricing')
@Index(['productId'])
@Index(['priceTier'])
export class ProductPricing extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'varchar', length: 50 })
  priceTier: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 1 })
  minQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxQuantity?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unitPrice: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currencyCode: string;

  @Column({ type: 'date', nullable: true })
  effectiveStartDate?: Date;

  @Column({ type: 'date', nullable: true })
  effectiveEndDate?: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @ManyToOne(() => PartnumberInfo, (product) => product.pricing, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product?: PartnumberInfo;
}
