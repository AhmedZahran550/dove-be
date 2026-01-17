import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum WebhookEventStatus {
  RECEIVED = 'received',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Tracks webhook events for idempotency and audit purposes.
 * Prevents duplicate processing of the same event.
 */
@Entity('webhook_events')
@Index(['eventId'], { unique: true })
@Index(['eventType'])
@Index(['status'])
@Index(['createdAt'])
export class WebhookEvent extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  eventId: string;

  @Column({ type: 'varchar', length: 100 })
  eventType: string;

  @Column({ type: 'varchar', length: 50, default: 'stripe' })
  provider: string;

  @Column({
    type: 'enum',
    enum: WebhookEventStatus,
    default: WebhookEventStatus.RECEIVED,
  })
  status: WebhookEventStatus;

  @Column({ type: 'jsonb', nullable: true })
  payload?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'integer', default: 0 })
  processingAttempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt?: Date;
}
