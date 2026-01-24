import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Operator } from './operator.entity';
import { Company } from './company.entity';

@Entity('operator_sessions')
export class OperatorSession extends BaseEntity {
  @Column({ type: 'uuid' })
  operator_id: string;

  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'text', unique: true })
  token_hash: string;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @Column({ type: 'inet', nullable: true })
  ip_address: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  last_activity_at: Date;

  // Relations
  @ManyToOne(() => Operator)
  @JoinColumn({ name: 'operator_id' })
  operator: Operator;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
