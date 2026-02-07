import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';

@Entity('company_column_mappings')
@Index(['companyId'])
@Index(['isActive'])
@Index(['isDefault'])
export class CompanyColumnMapping extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  mappingName: string;

  // JSON object: Excel column name -> normalized column name
  @Column({ type: 'jsonb', nullable: true })
  normalizationRules?: Record<string, string>;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, default: 'excel' })
  sourceType: string;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  requiredColumns?: string[];

  // JSON object: target field -> { source_column, alternate_columns }
  @Column({ type: 'jsonb', nullable: true })
  mappingConfig?: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastUsedAt?: Date;

  @Column({ type: 'integer', default: 0 })
  successCount: number;

  // Relations
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company?: Company;
}
