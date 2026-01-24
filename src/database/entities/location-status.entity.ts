import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Location } from './location.entity';
import { WorkOrderStatus } from './work-order-status.entity';
import { UserProfile } from './user-profile.entity';

@Entity('location_statuses')
export class LocationStatus extends BaseEntity {
  @Column({ type: 'uuid' })
  location_id: string;

  @Column({ type: 'uuid' })
  status_id: string;

  @Column({ type: 'boolean', default: true })
  is_visible: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location_display_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  location_color: string;

  @Column({ type: 'text', nullable: true })
  location_notes: string;

  // Relations
  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @ManyToOne(() => WorkOrderStatus)
  @JoinColumn({ name: 'status_id' })
  status: WorkOrderStatus;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'created_by' })
  createdByUser: UserProfile;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'updated_by' })
  updatedByUser: UserProfile;
}
