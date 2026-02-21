import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { User } from './user.entity';

@Entity('schedule_api_keys')
export class ScheduleApiKey extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'varchar', unique: true })
  apiKey: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastUsedAt: Date;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  createdByUser: User;
}
