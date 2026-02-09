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
import { UserProfile } from './user-profile.entity';
import { ScheduleData } from './schedule-data.entity';

@Entity('schedule_files')
@Index(['companyId'])
@Index(['isActive'])
@Index(['fileName'])
export class ScheduleFile extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'text', nullable: true })
  filePath?: string;

  @Column({ type: 'text', nullable: true })
  fileUrl?: string;

  @Column({ type: 'varchar', length: 50, default: 'database' })
  sourceType: string;

  @Column({ type: 'varchar', length: 50, default: 'hourly' })
  syncFrequency: string;

  @Column({ type: 'boolean', default: true })
  autoSyncEnabled: boolean;

  @Column({ type: 'boolean', default: true })
  publishToSchedulePage: boolean;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastSyncedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @Column({ type: 'uuid', nullable: true })
  uploadedBy?: string;

  // Relations
  @ManyToOne(() => Company, (company) => company.scheduleFiles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'uploadedBy' })
  uploader?: UserProfile;

  @OneToMany(() => ScheduleData, (data) => data.scheduleFile)
  scheduleData?: ScheduleData[];
}
