import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';

@Entity('organization_invitations')
export class OrganizationInvitation extends BaseEntity {
  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text', nullable: true })
  recipientName: string;

  @Column({ type: 'text', unique: true })
  token: string;

  @Column({ type: 'text', default: 'pending' })
  status: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  acceptedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdOrganizationId: string;

  @Column({ type: 'text' })
  organizationName: string;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'created_organization_id' })
  createdOrganization: Company;
}
