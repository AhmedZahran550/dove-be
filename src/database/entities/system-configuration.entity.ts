import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { UserProfile } from './user-profile.entity';

@Entity('system_configurations')
@Unique(['companyId', 'configKey'])
@Index(['companyId'])
@Index(['category'])
@Index(['isActive'])
export class SystemConfiguration extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'varchar', length: 100 })
  configKey: string;

  @Column({ type: 'text', nullable: true })
  configValue?: string;

  @Column({ type: 'varchar', length: 50, default: 'string' })
  configType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'uuid', nullable: true })
  updatedBy?: string;

  // Relations
  @ManyToOne(() => Company, (company) => company.systemConfigurations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'createdBy' })
  creator?: UserProfile;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'updatedBy' })
  updater?: UserProfile;
}
