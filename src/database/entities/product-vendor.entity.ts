import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { PartnumberInfo } from './partnumber-info.entity';

@Entity('product_vendors')
@Index(['companyId'])
@Index(['productId'])
export class ProductVendor extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'uuid', nullable: true })
  vendorId?: string;

  @Column({ type: 'varchar', length: 255 })
  vendorName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  vendorPartNumber?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  cost?: number;

  @Column({ type: 'integer', nullable: true })
  leadTimeDays?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  minimumOrderQty?: number;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'date', nullable: true })
  lastPurchaseDate?: Date;

  // Relations
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @ManyToOne(() => PartnumberInfo, (product) => product.productVendors, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product?: PartnumberInfo;
}
