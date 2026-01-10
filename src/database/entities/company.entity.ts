import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Location } from './location.entity';
import { UserProfile } from './user-profile.entity';
import { WorkOrderStatus } from './work-order-status.entity';
import { WorkOrder } from './work-order.entity';
import { TimeSegment } from './time-segment.entity';
import { RejectionCategory } from './rejection-category.entity';
import { RejectionReason } from './rejection-reason.entity';
import { QCRejection } from './qc-rejection.entity';
import { SystemConfiguration } from './system-configuration.entity';
import { ScheduleFile } from './schedule-file.entity';
import { ScheduleData } from './schedule-data.entity';

@Entity('companies')
@Index(['slug'])
export class Company extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  industry?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 50, default: 'America/Toronto' })
  timezone: string;

  @Column({ type: 'varchar', length: 50, default: 'free' })
  subscriptionTier: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  subscriptionStatus: string;

  @Column({ type: 'timestamptz', nullable: true })
  trialEndsAt?: Date;

  @Column({ type: 'integer', default: 5 })
  maxUsers: number;

  @Column({ type: 'integer', default: 1 })
  maxLocations: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relations
  @OneToMany(() => Location, (location) => location.company)
  locations?: Location[];

  @OneToMany(() => UserProfile, (userProfile) => userProfile.company)
  userProfiles?: UserProfile[];

  @OneToMany(() => WorkOrderStatus, (status) => status.company)
  workOrderStatuses?: WorkOrderStatus[];

  @OneToMany(() => WorkOrder, (workOrder) => workOrder.company)
  workOrders?: WorkOrder[];

  @OneToMany(() => TimeSegment, (timeSegment) => timeSegment.company)
  timeSegments?: TimeSegment[];

  @OneToMany(() => RejectionCategory, (category) => category.company)
  rejectionCategories?: RejectionCategory[];

  @OneToMany(() => RejectionReason, (reason) => reason.company)
  rejectionReasons?: RejectionReason[];

  @OneToMany(() => QCRejection, (rejection) => rejection.company)
  qcRejections?: QCRejection[];

  @OneToMany(() => SystemConfiguration, (config) => config.company)
  systemConfigurations?: SystemConfiguration[];

  @OneToMany(() => ScheduleFile, (file) => file.company)
  scheduleFiles?: ScheduleFile[];

  @OneToMany(() => ScheduleData, (data) => data.company)
  scheduleData?: ScheduleData[];
}
