import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { User } from './user.entity';
import { Role } from '@/modules/auth/role.model';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('invitations')
@Index('idx_invitations_company_id', ['companyId'])
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
  locationId: string;

  @Column({ type: 'text', unique: true })
  token: string;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'uuid', nullable: true })
  invitedBy: string;

  @Column({ type: 'timestamptz', nullable: true })
  acceptedAt: Date;

  // Relations`
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'invited_by' })
  invitedByUser: User;
}
