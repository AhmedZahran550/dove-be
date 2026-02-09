import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { CompanyColumnMapping } from './company-column-mapping.entity';
import { UserProfile } from './user-profile.entity';

@Entity('column_mapping_history')
export class ColumnMappingHistory extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid', nullable: true })
  mappingId: string;

  @Column({ type: 'varchar' })
  action: string;

  @Column({ type: 'varchar', nullable: true })
  sourceFileName: string;

  @Column({ type: 'jsonb', nullable: true })
  sourceColumns: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  mappedColumns: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  unmappedColumns: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  rowsProcessed: number;

  @Column({ type: 'int', default: 0 })
  rowsSucceeded: number;

  @Column({ type: 'int', default: 0 })
  rowsFailed: number;

  @Column({ type: 'jsonb', nullable: true })
  errorDetails: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  performedBy: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  performedAt: Date;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => CompanyColumnMapping)
  @JoinColumn({ name: 'mapping_id' })
  mapping: CompanyColumnMapping;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'performed_by' })
  performedByUser: UserProfile;
}
