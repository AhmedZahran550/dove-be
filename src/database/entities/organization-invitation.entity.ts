import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';

@Entity('organization_invitations')
export class OrganizationInvitation extends BaseEntity {
  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text', nullable: true })
  recipient_name: string;

  @Column({ type: 'text', unique: true })
  token: string;

  @Column({ type: 'text', default: 'pending' })
  status: string;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  accepted_at: Date;

  @Column({ type: 'uuid', nullable: true })
  created_organization_id: string;

  @Column({ type: 'text' })
  organization_name: string;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'created_organization_id' })
  createdOrganization: Company;
}
