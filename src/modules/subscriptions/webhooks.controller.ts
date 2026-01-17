import {
  Controller,
  Post,
  Req,
  Headers,
  RawBodyRequest,
  Logger,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { SubscriptionsService } from './subscriptions.service';
import { WebhookService } from './webhook.service';
import { Public } from '../auth/decorators/public.decorator';
import { BillingCycle } from '@/database/entities/subscription.entity';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private stripeService: StripeService,
    private subscriptionsService: SubscriptionsService,
    private webhookService: WebhookService,
  ) {}

  /**
   * Handle Stripe webhook events.
   *
   * Best practices implemented:
   * 1. ✅ Signature verification - Validates webhook came from Stripe
   * 2. ✅ Idempotency - Processes each event only once (tracks in database)
   * 3. ✅ Quick response - Returns 200 immediately, processes asynchronously
   * 4. ✅ Comprehensive logging - Logs all events for debugging/reconciliation
   * 5. ✅ Error handling - Captures and logs errors without causing retries
   */
  @Public()
  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const startTime = Date.now();

    // Validate raw body exists
    if (!req.rawBody) {
      this.logger.error('Webhook received without raw body');
      throw new BadRequestException('Missing raw body');
    }

    if (!signature) {
      this.logger.error('Webhook received without signature header');
      throw new BadRequestException('Missing signature');
    }

    // 1. SIGNATURE VERIFICATION - Validate webhook came from Stripe
    let event;
    try {
      event = await this.stripeService.constructWebhookEvent(
        req.rawBody,
        signature,
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed`, {
        error: (err as Error).message,
        signatureLength: signature?.length,
      });
      throw new BadRequestException('Invalid webhook signature');
    }

    // Comprehensive logging for audit trail
    this.logger.log(`Received Stripe webhook`, {
      eventId: event.id,
      eventType: event.type,
      created: new Date(event.created * 1000).toISOString(),
      livemode: event.livemode,
    });

    // 2. IDEMPOTENCY CHECK - Prevent duplicate processing
    const shouldProcess = await this.webhookService.shouldProcessEvent(
      event.id,
      event.type,
      'stripe',
      { livemode: event.livemode, apiVersion: event.api_version },
    );

    if (!shouldProcess) {
      this.logger.log(`Event ${event.id} skipped (already processed)`);
      return { received: true, processed: false, reason: 'duplicate' };
    }

    // 3. PROCESS ASYNCHRONOUSLY - Don't block the response
    // Use setImmediate to return 200 immediately while processing continues
    setImmediate(async () => {
      await this.processEventAsync(event, startTime);
    });

    // Return immediately to acknowledge receipt
    return { received: true, eventId: event.id };
  }

  /**
   * Process webhook event asynchronously.
   * This runs after we've returned 200 to Stripe.
   */
  private async processEventAsync(
    event: any,
    startTime: number,
  ): Promise<void> {
    try {
      let metadata: Record<string, any> = {};

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const { companyId, userId, planId, billingCycle } =
            session.metadata || {};

          this.logger.log(`Processing checkout.session.completed`, {
            eventId: event.id,
            companyId,
            planId,
            billingCycle,
            subscriptionId: session.subscription,
          });

          if (companyId && planId) {
            await this.subscriptionsService.handleCheckoutCompleted(
              companyId,
              userId,
              planId,
              (billingCycle as BillingCycle) || BillingCycle.MONTHLY,
              session.subscription as string,
            );
            metadata = { companyId, planId, action: 'subscription_created' };
          } else {
            this.logger.warn(
              `checkout.session.completed missing required metadata`,
              {
                eventId: event.id,
                hasCompanyId: !!companyId,
                hasPlanId: !!planId,
              },
            );
            metadata = { error: 'missing_metadata' };
          }
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object;

          this.logger.log(`Processing invoice.payment_succeeded`, {
            eventId: event.id,
            invoiceId: invoice.id,
            subscriptionId: invoice.subscription,
            amountPaid: invoice.amount_paid,
            currency: invoice.currency,
          });

          if (invoice.subscription) {
            await this.subscriptionsService.handlePaymentSucceeded(
              invoice.subscription as string,
              invoice.id,
              invoice.amount_paid,
            );
            metadata = {
              subscriptionId: invoice.subscription,
              invoiceId: invoice.id,
              amount: invoice.amount_paid,
              action: 'payment_succeeded',
            };
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object;

          this.logger.warn(`Processing invoice.payment_failed`, {
            eventId: event.id,
            invoiceId: invoice.id,
            subscriptionId: invoice.subscription,
            attemptCount: invoice.attempt_count,
          });

          if (invoice.subscription) {
            await this.subscriptionsService.handlePaymentFailed(
              invoice.subscription as string,
            );
            metadata = {
              subscriptionId: invoice.subscription,
              invoiceId: invoice.id,
              attemptCount: invoice.attempt_count,
              action: 'payment_failed',
            };
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object;

          this.logger.log(`Processing customer.subscription.deleted`, {
            eventId: event.id,
            subscriptionId: subscription.id,
            status: subscription.status,
            canceledAt: subscription.canceled_at,
          });

          await this.subscriptionsService.handleSubscriptionDeleted(
            subscription.id,
          );
          metadata = {
            subscriptionId: subscription.id,
            action: 'subscription_deleted',
          };
          break;
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object;

          this.logger.log(`Processing customer.subscription.updated`, {
            eventId: event.id,
            subscriptionId: subscription.id,
            status: subscription.status,
            currentPeriodEnd: subscription.current_period_end,
          });

          // Log for audit - could implement status sync if needed
          metadata = {
            subscriptionId: subscription.id,
            status: subscription.status,
            action: 'subscription_updated',
          };
          break;
        }

        default:
          this.logger.log(`Unhandled event type: ${event.type}`, {
            eventId: event.id,
          });
          metadata = { action: 'unhandled', eventType: event.type };
      }

      // Mark event as completed
      const processingTime = Date.now() - startTime;
      metadata.processingTimeMs = processingTime;

      await this.webhookService.markEventCompleted(event.id, metadata);

      this.logger.log(`Event ${event.id} processed successfully`, {
        eventType: event.type,
        processingTimeMs: processingTime,
      });
    } catch (error) {
      const errorMessage = (error as Error).message || 'Unknown error';

      this.logger.error(`Error processing webhook event ${event.id}`, {
        eventId: event.id,
        eventType: event.type,
        error: errorMessage,
        stack: (error as Error).stack,
      });

      // Mark event as failed for investigation
      await this.webhookService.markEventFailed(event.id, errorMessage);

      // Don't rethrow - we've already returned 200 to Stripe
      // Failed events can be retried manually or via cron job
    }
  }
}
