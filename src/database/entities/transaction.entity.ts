import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { Subscription } from './subscription.entity';

export enum TransactionType {
  TRIAL_STARTED = 'trial_started',
  TRIAL_ENDED = 'trial_ended',
  SUBSCRIPTION_PAYMENT = 'subscription_payment',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',
  REFUND = 'refund',
  PLAN_CHANGED = 'plan_changed',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

@Entity('transactions')
@Index(['companyId'])
@Index(['subscriptionId'])
export class Transaction extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid', nullable: true })
  subscriptionId?: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripePaymentIntentId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeInvoiceId?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Relations
  @ManyToOne(() => Company, (company) => company.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @ManyToOne(() => Subscription, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'subscriptionId' })
  subscription?: Subscription;
}
