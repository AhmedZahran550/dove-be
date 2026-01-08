import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Company } from './company.entity';
import { Location } from './location.entity';

// User entity uses PrimaryColumn instead of PrimaryGeneratedColumn
// because id comes from auth system, so we don't extend BaseEntity
@Entity('user_profiles')
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'uuid', nullable: true })
  location_id: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 100, nullable: true })
  first_name: string;

  @Column({ length: 100, nullable: true })
  last_name: string;

  @Column({ length: 50, default: 'operator' })
  role: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  avatar_url: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  last_login_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  // Auth-specific fields
  @Column({ nullable: true })
  @Exclude()
  password_hash: string;

  @Column({ nullable: true })
  @Exclude()
  refresh_token: string;

  // Relations
  @ManyToOne(() => Company, (company) => company.users)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'location_id' })
  location: Location;
}
