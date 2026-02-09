import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  Company,
  Subscription as SubscriptionEntity,
  Transaction,
  Plan,
} from '@/database/entities';
import {
  SubscriptionStatus,
  BillingCycle,
} from '@/database/entities/subscription.entity';
import {
  TransactionType,
  TransactionStatus,
} from '@/database/entities/transaction.entity';
import { PlansService } from '../plans/plans.service';
import { StripeService } from './stripe.service';
import { CreateCheckoutDto, ChangePlanDto } from './dto';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(SubscriptionEntity)
    private subscriptionsRepository: Repository<SubscriptionEntity>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    private plansService: PlansService,
    private stripeService: StripeService,
    private configService: ConfigService,
  ) {}

  async getPlansForCompany(companyId: string): Promise<Plan[]> {
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.plansService.findActivePlansForCompany(
      company.hasUsedFreeTrial,
    );
  }

  async getCurrentSubscription(
    companyId: string,
  ): Promise<SubscriptionEntity | null> {
    return this.subscriptionsRepository.findOne({
      where: {
        companyId,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async startFreeTrial(
    companyId: string,
    userId: string,
  ): Promise<SubscriptionEntity> {
    // Get company
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Check if company has already used free trial
    if (company.hasUsedFreeTrial) {
      throw new BadRequestException(
        'Your company has already used the one-time free trial. Please choose a paid plan.',
      );
    }

    // Check if company already has an active subscription
    const existingSubscription = await this.getCurrentSubscription(companyId);
    if (existingSubscription) {
      throw new BadRequestException(
        'Your company already has an active subscription.',
      );
    }

    // Get the free trial plan
    const freeTrialPlan = await this.plansService.findByCode('free_trial');
    if (!freeTrialPlan) {
      throw new NotFoundException(
        'Free trial plan not found. Please contact support.',
      );
    }

    // Calculate trial end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + freeTrialPlan.trialDays);

    // Create subscription
    const subscription = this.subscriptionsRepository.create({
      companyId,
      planId: freeTrialPlan.id,
      status: SubscriptionStatus.ACTIVE,
      startDate,
      endDate,
      billingCycle: BillingCycle.MONTHLY,
      amount: 0,
      createdBy: userId,
    });

    await this.subscriptionsRepository.save(subscription);

    // Mark company as having used free trial
    await this.companiesRepository.update(companyId, {
      hasUsedFreeTrial: true,
      subscriptionTier: 'free_trial',
      subscriptionStatus: 'active',
      trialEndsAt: endDate,
    });

    // Create transaction record
    const transaction = this.transactionsRepository.create({
      companyId,
      subscriptionId: subscription.id,
      type: TransactionType.TRIAL_STARTED,
      status: TransactionStatus.SUCCEEDED,
      amount: 0,
      description: `Free trial started for ${freeTrialPlan.trialDays} days`,
      createdBy: userId,
    });

    await this.transactionsRepository.save(transaction);

    this.logger.log(`Company ${companyId} started free trial`);

    return subscription;
  }

  async createCheckoutSession(
    companyId: string,
    userId: string,
    dto: CreateCheckoutDto,
  ): Promise<{ sessionId: string; url: string }> {
    // Get company
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Get plan
    const plan = await this.plansService.findById(dto.planId);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (plan.isFreeTrial) {
      throw new BadRequestException(
        'Cannot checkout free trial plan. Use the free trial endpoint.',
      );
    }

    // Determine price ID based on billing cycle
    const billingCycle = dto.billingCycle || BillingCycle.MONTHLY;
    const priceId =
      billingCycle === BillingCycle.YEARLY
        ? plan.stripePriceIdYearly
        : plan.stripePriceIdMonthly;

    if (!priceId) {
      throw new BadRequestException(
        'Stripe price not configured for this plan',
      );
    }

    // Create or get Stripe customer
    let stripeCustomerId = company.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await this.stripeService.createCustomer(
        company.email || '',
        company.name,
        { companyId: company.id },
      );
      stripeCustomerId = customer.id;

      await this.companiesRepository.update(companyId, {
        stripeCustomerId,
      });
    }

    // Get URLs from config or DTO
    const baseUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3000',
    );
    const successUrl =
      dto.successUrl ||
      `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = dto.cancelUrl || `${baseUrl}/subscription/cancel`;

    // Create checkout session
    const session = await this.stripeService.createCheckoutSession(
      stripeCustomerId,
      priceId,
      {
        companyId,
        userId,
        planId: plan.id,
        billingCycle,
      },
      successUrl,
      cancelUrl,
    );

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async cancelSubscription(
    companyId: string,
    userId: string,
  ): Promise<SubscriptionEntity> {
    const subscription = await this.getCurrentSubscription(companyId);

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    // Cancel in Stripe if paid subscription
    if (subscription.stripeSubscriptionId) {
      await this.stripeService.cancelSubscription(
        subscription.stripeSubscriptionId,
      );
    }

    // Update subscription status
    subscription.status = SubscriptionStatus.CANCELED;
    subscription.canceledAt = new Date();
    await this.subscriptionsRepository.save(subscription);

    // Update company
    await this.companiesRepository.update(companyId, {
      subscriptionStatus: 'canceled',
    });

    // Create transaction record
    const transaction = this.transactionsRepository.create({
      companyId,
      subscriptionId: subscription.id,
      type: TransactionType.TRIAL_ENDED,
      status: TransactionStatus.SUCCEEDED,
      amount: 0,
      description: 'Subscription canceled',
      createdBy: userId,
    });

    await this.transactionsRepository.save(transaction);

    this.logger.log(`Company ${companyId} canceled subscription`);

    return subscription;
  }

  async changePlan(
    companyId: string,
    userId: string,
    dto: ChangePlanDto,
  ): Promise<{
    sessionId?: string;
    url?: string;
    subscription?: SubscriptionEntity;
  }> {
    const subscription = await this.getCurrentSubscription(companyId);

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    const newPlan = await this.plansService.findById(dto.planId);
    if (!newPlan) {
      throw new NotFoundException('Plan not found');
    }

    if (newPlan.isFreeTrial) {
      throw new BadRequestException('Cannot change to free trial plan');
    }

    // If current subscription is free trial, create checkout instead
    if (!subscription.stripeSubscriptionId) {
      return this.createCheckoutSession(companyId, userId, {
        planId: dto.planId,
        billingCycle: dto.billingCycle,
      });
    }

    // Update existing Stripe subscription
    const billingCycle = dto.billingCycle || subscription.billingCycle;
    const priceId =
      billingCycle === BillingCycle.YEARLY
        ? newPlan.stripePriceIdYearly
        : newPlan.stripePriceIdMonthly;

    if (!priceId) {
      throw new BadRequestException(
        'Stripe price not configured for this plan',
      );
    }

    await this.stripeService.updateSubscription(
      subscription.stripeSubscriptionId,
      priceId,
    );

    // Update subscription record
    subscription.planId = newPlan.id;
    subscription.billingCycle = billingCycle;
    subscription.amount =
      billingCycle === BillingCycle.YEARLY
        ? Number(newPlan.yearlyPrice)
        : Number(newPlan.monthlyPrice);
    await this.subscriptionsRepository.save(subscription);

    // Update company
    await this.companiesRepository.update(companyId, {
      subscriptionTier: newPlan.code,
      maxUsers: newPlan.maxUsers,
      maxLocations: newPlan.maxLocations,
    });

    // Create transaction record
    const transaction = this.transactionsRepository.create({
      companyId,
      subscriptionId: subscription.id,
      type: TransactionType.PLAN_CHANGED,
      status: TransactionStatus.SUCCEEDED,
      amount: subscription.amount,
      description: `Plan changed to ${newPlan.name}`,
      createdBy: userId,
    });

    await this.transactionsRepository.save(transaction);

    this.logger.log(`Company ${companyId} changed plan to ${newPlan.code}`);

    return { subscription };
  }

  async createBillingPortalSession(
    companyId: string,
  ): Promise<{ url: string }> {
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (!company.stripeCustomerId) {
      throw new BadRequestException(
        'No billing account found. Please subscribe to a paid plan first.',
      );
    }

    const baseUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3000',
    );
    const returnUrl = `${baseUrl}/settings/subscription`;

    const session = await this.stripeService.createBillingPortalSession(
      company.stripeCustomerId,
      returnUrl,
    );

    return { url: session.url };
  }

  async getTransactionHistory(companyId: string): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { companyId },
      relations: ['subscription', 'subscription.plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async checkFeatureAccess(
    companyId: string,
    featureName: string,
  ): Promise<boolean> {
    const subscription = await this.getCurrentSubscription(companyId);

    if (!subscription || !subscription.plan) {
      return false;
    }

    // Check if subscription is still valid
    if (subscription.endDate && subscription.endDate < new Date()) {
      return false;
    }

    return subscription.plan.features.includes(featureName);
  }

  // Webhook handlers
  async handleCheckoutCompleted(
    companyId: string,
    userId: string,
    planId: string,
    billingCycle: BillingCycle,
    stripeSubscriptionId: string,
  ): Promise<void> {
    const plan = await this.plansService.findById(planId);
    if (!plan) {
      this.logger.error(`Plan ${planId} not found during webhook processing`);
      return;
    }

    // Expire any existing subscriptions
    await this.subscriptionsRepository.update(
      { companyId, status: SubscriptionStatus.ACTIVE },
      { status: SubscriptionStatus.EXPIRED, endDate: new Date() },
    );

    // Get Stripe subscription for billing details
    const stripeSubscription: Stripe.Subscription =
      await this.stripeService.getSubscription(stripeSubscriptionId);

    // Create new subscription
    const subscription = this.subscriptionsRepository.create({
      companyId,
      planId: plan.id,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      billingCycle,
      amount:
        billingCycle === BillingCycle.YEARLY
          ? Number(plan.yearlyPrice)
          : Number(plan.monthlyPrice),
      stripeSubscriptionId,
      nextBillingDate: new Date(
        (stripeSubscription as any).current_period_end * 1000,
      ),
      createdBy: userId,
    });

    await this.subscriptionsRepository.save(subscription);

    // Update company
    await this.companiesRepository.update(companyId, {
      subscriptionTier: plan.code,
      subscriptionStatus: 'active',
      maxUsers: plan.maxUsers,
      maxLocations: plan.maxLocations,
      trialEndsAt: undefined,
    });

    // Create transaction
    const transaction = this.transactionsRepository.create({
      companyId,
      subscriptionId: subscription.id,
      type: TransactionType.SUBSCRIPTION_PAYMENT,
      status: TransactionStatus.SUCCEEDED,
      amount: subscription.amount,
      stripePaymentIntentId: stripeSubscription.latest_invoice as string,
      description: `Subscribed to ${plan.name} (${billingCycle})`,
      createdBy: userId,
    });

    await this.transactionsRepository.save(transaction);

    this.logger.log(
      `Company ${companyId} completed checkout for plan ${plan.code}`,
    );
  }

  async handlePaymentSucceeded(
    stripeSubscriptionId: string,
    stripeInvoiceId: string,
    amount: number,
  ): Promise<void> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { stripeSubscriptionId },
      relations: ['plan'],
    });

    if (!subscription) {
      this.logger.warn(`Subscription not found for ${stripeSubscriptionId}`);
      return;
    }

    // Update next billing date
    const stripeSubData: Stripe.Subscription =
      await this.stripeService.getSubscription(stripeSubscriptionId);
    subscription.nextBillingDate = new Date(
      (stripeSubData as any).current_period_end * 1000,
    );
    await this.subscriptionsRepository.save(subscription);

    // Create transaction
    const transaction = this.transactionsRepository.create({
      companyId: subscription.companyId,
      subscriptionId: subscription.id,
      type: TransactionType.SUBSCRIPTION_RENEWED,
      status: TransactionStatus.SUCCEEDED,
      amount: amount / 100, // Stripe amounts are in cents
      stripeInvoiceId,
      description: `Subscription renewed - ${subscription.plan?.name}`,
    });

    await this.transactionsRepository.save(transaction);

    this.logger.log(
      `Payment succeeded for subscription ${stripeSubscriptionId}`,
    );
  }

  async handlePaymentFailed(stripeSubscriptionId: string): Promise<void> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { stripeSubscriptionId },
    });

    if (!subscription) {
      this.logger.warn(`Subscription not found for ${stripeSubscriptionId}`);
      return;
    }

    subscription.status = SubscriptionStatus.PAST_DUE;
    await this.subscriptionsRepository.save(subscription);

    await this.companiesRepository.update(subscription.companyId, {
      subscriptionStatus: 'past_due',
    });

    this.logger.log(`Payment failed for subscription ${stripeSubscriptionId}`);
  }

  async handleSubscriptionDeleted(stripeSubscriptionId: string): Promise<void> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { stripeSubscriptionId },
    });

    if (!subscription) {
      this.logger.warn(`Subscription not found for ${stripeSubscriptionId}`);
      return;
    }

    subscription.status = SubscriptionStatus.CANCELED;
    subscription.canceledAt = new Date();
    await this.subscriptionsRepository.save(subscription);

    await this.companiesRepository.update(subscription.companyId, {
      subscriptionStatus: 'canceled',
    });

    this.logger.log(`Subscription ${stripeSubscriptionId} deleted/canceled`);
  }
}
