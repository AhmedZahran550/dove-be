import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe | null = null;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey);
    } else {
      this.logger.warn(
        'STRIPE_SECRET_KEY not configured. Stripe features will be disabled.',
      );
    }
  }

  private ensureStripeConfigured(): Stripe {
    if (!this.stripe) {
      throw new Error(
        'Stripe is not configured. Please set STRIPE_SECRET_KEY.',
      );
    }
    return this.stripe;
  }

  async createCustomer(
    email: string,
    name: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Customer> {
    const stripe = this.ensureStripeConfigured();
    return stripe.customers.create({
      email,
      name,
      metadata,
    });
  }

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    metadata: Record<string, string>,
    successUrl: string,
    cancelUrl: string,
  ): Promise<Stripe.Checkout.Session> {
    const stripe = this.ensureStripeConfigured();
    return stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async createBillingPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<Stripe.BillingPortal.Session> {
    const stripe = this.ensureStripeConfigured();
    return stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  async cancelSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    const stripe = this.ensureStripeConfigured();
    return stripe.subscriptions.cancel(subscriptionId);
  }

  async updateSubscription(
    subscriptionId: string,
    newPriceId: string,
  ): Promise<Stripe.Subscription> {
    const stripe = this.ensureStripeConfigured();

    // Get the subscription to find the current item
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const itemId = subscription.items.data[0]?.id;

    if (!itemId) {
      throw new Error('No subscription item found');
    }

    return stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: itemId,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });
  }

  async constructWebhookEvent(
    payload: Buffer,
    signature: string,
  ): Promise<Stripe.Event> {
    const stripe = this.ensureStripeConfigured();
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    const stripe = this.ensureStripeConfigured();
    return stripe.subscriptions.retrieve(subscriptionId);
  }

  async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    const stripe = this.ensureStripeConfigured();
    return stripe.invoices.retrieve(invoiceId);
  }
}
