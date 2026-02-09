import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Location } from './location.entity';
import { WorkOrderStatus } from './work-order-status.entity';
import { UserProfile } from './user-profile.entity';

@Entity('location_statuses')
export class LocationStatus extends BaseEntity {
  @Column({ type: 'uuid' })
  locationId: string;

  @Column({ type: 'uuid' })
  statusId: string;

  @Column({ type: 'boolean', default: true })
  isVisible: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  locationDisplayName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  locationColor: string;

  @Column({ type: 'text', nullable: true })
  locationNotes: string;

  // Relations
  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @ManyToOne(() => WorkOrderStatus)
  @JoinColumn({ name: 'status_id' })
  status: WorkOrderStatus;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  createdByUser: UserProfile;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'updated_by' })
  updatedByUser: UserProfile;
}
