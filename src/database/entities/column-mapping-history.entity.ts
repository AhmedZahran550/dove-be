import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { CompanyColumnMapping } from './company-column-mapping.entity';
import { UserProfile } from './user-profile.entity';

@Entity('column_mapping_history')
export class ColumnMappingHistory extends BaseEntity {
  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'uuid', nullable: true })
  mapping_id: string;

  @Column({ type: 'varchar' })
  action: string;

  @Column({ type: 'varchar', nullable: true })
  source_file_name: string;

  @Column({ type: 'jsonb', nullable: true })
  source_columns: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  mapped_columns: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  unmapped_columns: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  rows_processed: number;

  @Column({ type: 'int', default: 0 })
  rows_succeeded: number;

  @Column({ type: 'int', default: 0 })
  rows_failed: number;

  @Column({ type: 'jsonb', nullable: true })
  error_details: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  performed_by: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  performed_at: Date;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => CompanyColumnMapping)
  @JoinColumn({ name: 'mapping_id' })
  mapping: CompanyColumnMapping;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'performed_by' })
  performedBy: UserProfile;
}
