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

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', length: 50, default: 'operator' })
  role: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  avatarUrl?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  @Exclude()
  @Column({ select: false })
  password: string;

  // Relations
  @ManyToOne(() => Company, (company) => company.userProfiles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @ManyToOne(() => Location, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'locationId' })
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
