import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { UserProfile } from './user-profile.entity';
import { Role } from '@/modules/auth/role.model';

@Entity('invitations')
@Index('idx_invitations_company_id', ['company'])
@Index('idx_invitations_email', ['email'])
@Index('idx_invitations_token', ['token'])
export class Invitation extends BaseEntity {
  @Column({ length: 255 })
  email: string;

  @Column({
    type: 'enum',
    enum: Role,
    nullable: true,
    default: [Role.OPERATOR],
  })
  role: Role;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  customMessage: string;

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

  // Relations`
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => UserProfile, { nullable: true })
  @JoinColumn({ name: 'invited_by' })
  invitedByUser: UserProfile;
}
