import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('column_mapping_templates')
export class ColumnMappingTemplate extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  templateName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  erpSystem: string;

  @Column({ type: 'boolean', default: false })
  isSystemTemplate: boolean;

  @Column({ type: 'jsonb' })
  mappingConfig: Record<string, any>;
}
