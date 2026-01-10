import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';

@Entity('product_categories')
@Unique(['companyId', 'categoryName'])
@Index(['companyId'])
@Index(['parentCategoryId'])
export class ProductCategory extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'varchar', length: 100 })
  categoryName: string;

  @Column({ type: 'uuid', nullable: true })
  parentCategoryId?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'integer', default: 0 })
  displayOrder: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @ManyToOne(() => ProductCategory, (category) => category.childCategories, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentCategoryId' })
  parentCategory?: ProductCategory;

  @OneToMany(() => ProductCategory, (category) => category.parentCategory)
  childCategories?: ProductCategory[];
}
