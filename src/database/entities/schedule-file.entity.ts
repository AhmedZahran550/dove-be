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
import { User } from './user.entity';
import { ScheduleData } from './schedule-data.entity';

@Entity('schedule_files')
@Index('idx_schedule_files_company_id', ['company_id'])
@Index('idx_schedule_files_is_active', ['is_active'])
export class ScheduleFile extends BaseEntity {
  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ length: 255 })
  file_name: string;

  @Column({ type: 'text', nullable: true })
  file_path: string;

  @Column({ type: 'text', nullable: true })
  file_url: string;

  @Column({ length: 50, default: 'database' })
  source_type: string;

  @Column({ length: 50, default: 'hourly' })
  sync_frequency: string;

  @Column({ default: true })
  auto_sync_enabled: boolean;

  @Column({ default: true })
  publish_to_schedule_page: boolean;

  @Column({ default: false })
  is_active: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  last_synced_at: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  uploaded_by: string;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy: User;

  @OneToMany(() => ScheduleData, (data) => data.scheduleFile)
  scheduleDataEntries: ScheduleData[];
}
