import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Operator } from './operator.entity';
import { Company } from './company.entity';

@Entity('operator_sessions')
export class OperatorSession extends BaseEntity {
  @Column({ type: 'uuid' })
  operatorId: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'text', unique: true })
  tokenHash: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'inet', nullable: true })
  ipAddress: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastActivityAt: Date;

  // Relations
  @ManyToOne(() => Operator)
  @JoinColumn({ name: 'operator_id' })
  operator: Operator;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
