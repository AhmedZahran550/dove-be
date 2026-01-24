import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('column_mapping_templates')
export class ColumnMappingTemplate extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  template_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  erp_system: string;

  @Column({ type: 'boolean', default: false })
  is_system_template: boolean;

  @Column({ type: 'jsonb' })
  mapping_config: Record<string, any>;
}
