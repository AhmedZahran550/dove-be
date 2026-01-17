import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('plans')
@Index(['code'], { unique: true })
export class Plan extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlyPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  yearlyPrice: number;

  @Column({ type: 'integer', default: 0 })
  trialDays: number;

  @Column({ type: 'jsonb', default: [] })
  features: string[];

  @Column({ type: 'integer', default: 5 })
  maxUsers: number;

  @Column({ type: 'integer', default: 1 })
  maxLocations: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isFreeTrial: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripePriceIdMonthly?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripePriceIdYearly?: string;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;
}
