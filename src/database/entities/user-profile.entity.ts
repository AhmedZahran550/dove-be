import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { Location } from './location.entity';
import { TimeSegment } from './time-segment.entity';
import { WorkOrderOperator } from './work-order-operator.entity';
import * as argon from 'argon2';
import { Exclude } from 'class-transformer';
import { Role } from '@/modules/auth/role.model';

@Entity('user_profiles')
@Index(['companyId'])
@Index(['locationId'])
@Index(['email'])
export class UserProfile extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid', nullable: true })
  locationId?: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName?: string;

  @Column({
    type: 'enum',
    enum: Role,
    array: true,
    default: [Role.OPERATOR],
  })
  roles: Role[];

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  avatarUrl?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  displayName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  employeeId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  role: string;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  permissions: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  emergencyContact: Record<string, any>;

  @Column({ type: 'date', nullable: true })
  hireDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  jobTitle: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  shiftPreference: string;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  preferences: Record<string, any>;

  @Exclude()
  @Column({ select: false })
  password: string;

  // Relations
  @ManyToOne(() => Company, (company) => company.userProfiles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @ManyToOne(() => Location, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'location_id' })
  location?: Location;

  @OneToMany(() => TimeSegment, (segment) => segment.operator)
  timeSegments?: TimeSegment[];

  @OneToMany(() => WorkOrderOperator, (wo) => wo.operator)
  workOrderOperators?: WorkOrderOperator[];

  @BeforeInsert()
  @BeforeUpdate()
  async beforeChanges() {
    if (this.password && this.password?.startsWith('$argon2')) {
      return;
    }
    if (this.password) {
      this.password = await argon.hash(this.password);
    }
  }
}
