import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeUpdate,
  BeforeInsert,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Company } from './company.entity';
import { Location } from './location.entity';
import * as argon from 'argon2';
import { BaseEntity } from './base.entity';

// User entity uses PrimaryColumn instead of PrimaryGeneratedColumn
// because id comes from auth system, so we don't extend BaseEntity
@Entity('user_profiles')
export class User extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid', nullable: true })
  locationId: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 100, nullable: true })
  firstName: string;

  @Column({ length: 100, nullable: true })
  lastName: string;

  @Column({ length: 50, default: 'operator' })
  role: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  avatarUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date;

  // Auth-specific fields
  @Column({ nullable: true })
  @Exclude()
  password: string;

  // Relations
  @ManyToOne(() => Company, (company) => company.users)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'location_id' })
  location: Location;

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
