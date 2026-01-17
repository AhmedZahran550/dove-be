import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { Plan } from './plan.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

@Entity('subscriptions')
@Index(['companyId'])
@Index(['status'])
export class Subscription extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  planId: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDate?: Date;

  @Column({
    type: 'enum',
    enum: BillingCycle,
    default: BillingCycle.MONTHLY,
  })
  billingCycle: BillingCycle;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeSubscriptionId?: string;

  @Column({ type: 'timestamptz', nullable: true })
  nextBillingDate?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  canceledAt?: Date;

  // Relations
  @ManyToOne(() => Company, (company) => company.subscriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @ManyToOne(() => Plan, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'planId' })
  plan?: Plan;
}
