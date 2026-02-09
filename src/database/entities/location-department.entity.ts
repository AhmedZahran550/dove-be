import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Location } from './location.entity';
import { Department } from './department.entity';
import { UserProfile } from './user-profile.entity';

@Entity('location_departments')
export class LocationDepartment extends BaseEntity {
  @Column({ type: 'uuid' })
  locationId: string;

  @Column({ type: 'uuid' })
  departmentId: string;

  @Column({ type: 'boolean', default: true })
  isVisible: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  locationDisplayName: string;

  @Column({ type: 'text', nullable: true })
  locationNotes: string;

  // Relations
  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  createdByUser: UserProfile;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'updated_by' })
  updatedByUser: UserProfile;
}
