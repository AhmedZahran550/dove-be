import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Location } from './location.entity';

@Entity('companies')
export class Company extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ length: 100, nullable: true })
  industry: string;

  @Column({ length: 255, nullable: true })
  website: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ length: 20, nullable: true })
  postal_code: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ length: 50, default: 'America/Toronto' })
  timezone: string;

  @Column({ length: 50, default: 'free' })
  subscription_tier: string;

  @Column({ length: 50, default: 'active' })
  subscription_status: string;

  @Column({ type: 'timestamptz', nullable: true })
  trial_ends_at: Date;

  @Column({ type: 'int', default: 5 })
  max_users: number;

  @Column({ type: 'int', default: 1 })
  max_locations: number;

  @Column({ default: true })
  is_active: boolean;

  // Relations (use lazy loading to avoid circular deps)
  @OneToMany('User', 'company')
  users: User[];

  @OneToMany('Location', 'company')
  locations: Location[];
}
