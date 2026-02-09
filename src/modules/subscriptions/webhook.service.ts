import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WebhookEvent,
  WebhookEventStatus,
} from '@/database/entities/webhook-event.entity';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectRepository(WebhookEvent)
    private webhookEventRepository: Repository<WebhookEvent>,
  ) {}

  /**
   * Check if an event has already been processed (idempotency check).
   * If not processed, creates a record to prevent duplicate processing.
   *
   * @returns true if event should be processed, false if already handled
   */
  async shouldProcessEvent(
    eventId: string,
    eventType: string,
    provider: string = 'stripe',
    payload?: Record<string, any>,
  ): Promise<boolean> {
    // Check if event already exists
    const existingEvent = await this.webhookEventRepository.findOne({
      where: { eventId },
    });

    if (existingEvent) {
      // Already processed or being processed
      if (existingEvent.status === WebhookEventStatus.COMPLETED) {
        this.logger.log(
          `Event ${eventId} already processed, skipping (idempotency)`,
        );
        return false;
      }

      if (existingEvent.status === WebhookEventStatus.PROCESSING) {
        // Check if processing started more than 5 minutes ago (stale lock)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (
          existingEvent.updatedAt &&
          existingEvent.updatedAt > fiveMinutesAgo
        ) {
          this.logger.log(
            `Event ${eventId} is being processed by another worker, skipping`,
          );
          return false;
        }
        // Stale lock - allow retry
        this.logger.warn(
          `Event ${eventId} has stale processing lock, allowing retry`,
        );
      }

      // Update to processing status for retry
      existingEvent.status = WebhookEventStatus.PROCESSING;
      existingEvent.processingAttempts += 1;
      await this.webhookEventRepository.save(existingEvent);
      return true;
    }

    // Create new event record
    try {
      const event = this.webhookEventRepository.create({
        eventId,
        eventType,
        provider,
        status: WebhookEventStatus.PROCESSING,
        payload,
        processingAttempts: 1,
      });
      await this.webhookEventRepository.save(event);
      return true;
    } catch (error) {
      // Handle race condition - another process may have inserted
      if (error?.code === '23505') {
        // Unique violation
        this.logger.log(`Event ${eventId} race condition detected, skipping`);
        return false;
      }
      throw error;
    }
  }

  /**
   * Mark an event as successfully completed.
   */
  async markEventCompleted(
    eventId: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.webhookEventRepository.update(
      { eventId },
      {
        status: WebhookEventStatus.COMPLETED,
        processedAt: new Date(),
        metadata,
      },
    );

    this.logger.log(`Event ${eventId} marked as completed`);
  }

  /**
   * Mark an event as failed.
   */
  async markEventFailed(eventId: string, errorMessage: string): Promise<void> {
    await this.webhookEventRepository.update(
      { eventId },
      {
        status: WebhookEventStatus.FAILED,
        errorMessage,
      },
    );

    this.logger.error(`Event ${eventId} marked as failed: ${errorMessage}`);
  }

  /**
   * Get event processing history for debugging/reconciliation.
   */
  async getEventHistory(filters?: {
    provider?: string;
    eventType?: string;
    status?: WebhookEventStatus;
    limit?: number;
  }): Promise<WebhookEvent[]> {
    const query = this.webhookEventRepository.createQueryBuilder('event');

    if (filters?.provider) {
      query.andWhere('event.provider = :provider', {
        provider: filters.provider,
      });
    }
    if (filters?.eventType) {
      query.andWhere('event.eventType = :eventType', {
        eventType: filters.eventType,
      });
    }
    if (filters?.status) {
      query.andWhere('event.status = :status', { status: filters.status });
    }

    query.orderBy('event.createdAt', 'DESC').take(filters?.limit || 100);

    return query.getMany();
  }

  /**
   * Get failed events for retry/investigation.
   */
  async getFailedEvents(limit: number = 50): Promise<WebhookEvent[]> {
    return this.getEventHistory({
      status: WebhookEventStatus.FAILED,
      limit,
    });
  }
}
