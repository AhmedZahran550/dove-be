import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Location } from './location.entity';
import { Department } from './department.entity';
import { UserProfile } from './user-profile.entity';

@Entity('location_departments')
export class LocationDepartment extends BaseEntity {
  @Column({ type: 'uuid' })
  location_id: string;

  @Column({ type: 'uuid' })
  department_id: string;

  @Column({ type: 'boolean', default: true })
  is_visible: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location_display_name: string;

  @Column({ type: 'text', nullable: true })
  location_notes: string;

  // Relations
  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'created_by' })
  createdByUser: UserProfile;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'updated_by' })
  updatedByUser: UserProfile;
}
