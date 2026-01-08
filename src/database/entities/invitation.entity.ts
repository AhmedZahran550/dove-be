import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { User } from './user.entity';

@Entity('invitations')
@Index('idx_invitations_company_id', ['company_id'])
@Index('idx_invitations_email', ['email'])
@Index('idx_invitations_token', ['token'])
export class Invitation extends BaseEntity {
  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 50 })
  role: string;

  @Column({ type: 'uuid', nullable: true })
  location_id: string;

  @Column({ type: 'text', unique: true })
  token: string;

  @Column({ length: 50, default: 'pending' })
  status: string;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @Column({ type: 'uuid', nullable: true })
  invited_by: string;

  @Column({ type: 'timestamptz', nullable: true })
  accepted_at: Date;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'invited_by' })
  invitedByUser: User;
}
