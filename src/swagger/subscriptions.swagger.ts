import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateCheckoutDto, ChangePlanDto } from '@/modules/subscriptions/dto';

export const SubscriptionsSwagger = {
  getPlans: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get available plans for company',
        description:
          'Returns active plans. Filters out free trial if company has already used it.',
      }),
      ApiResponse({ status: 200, description: 'Plans retrieved successfully' }),
    ),

  getCurrentSubscription: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get current subscription',
        description: 'Returns the active subscription for the company',
      }),
      ApiResponse({ status: 200, description: 'Subscription retrieved' }),
      ApiResponse({ status: 404, description: 'No active subscription found' }),
    ),

  startFreeTrial: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Start free trial',
        description: 'Start a free trial for the company. One-time only.',
      }),
      ApiResponse({ status: 201, description: 'Free trial started' }),
      ApiResponse({
        status: 400,
        description: 'Company already used free trial',
      }),
    ),

  createCheckout: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Create checkout session',
        description: 'Create a Stripe checkout session for paid subscription',
      }),
      ApiBody({ type: CreateCheckoutDto }),
      ApiResponse({ status: 201, description: 'Checkout session created' }),
      ApiResponse({
        status: 400,
        description: 'Invalid plan or Stripe not configured',
      }),
    ),

  cancelSubscription: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Cancel subscription',
        description: 'Cancel the current active subscription',
      }),
      ApiResponse({ status: 200, description: 'Subscription canceled' }),
      ApiResponse({ status: 404, description: 'No active subscription' }),
    ),

  changePlan: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Change subscription plan',
        description: 'Upgrade or downgrade to a different plan',
      }),
      ApiBody({ type: ChangePlanDto }),
      ApiResponse({ status: 200, description: 'Plan changed' }),
      ApiResponse({ status: 404, description: 'Plan not found' }),
    ),

  createBillingPortal: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Create billing portal session',
        description:
          'Get a link to Stripe billing portal for payment management',
      }),
      ApiResponse({ status: 200, description: 'Portal session created' }),
      ApiResponse({ status: 400, description: 'No billing account found' }),
    ),

  getTransactions: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get transaction history',
        description: 'Get all transactions for the company',
      }),
      ApiResponse({ status: 200, description: 'Transactions retrieved' }),
    ),

  checkFeature: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Check feature access',
        description:
          'Check if current subscription includes a specific feature',
      }),
      ApiParam({ name: 'name', description: 'Feature name to check' }),
      ApiResponse({
        status: 200,
        description: 'Feature access status returned',
      }),
    ),
};
