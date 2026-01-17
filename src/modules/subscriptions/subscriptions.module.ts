import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Subscription,
  Transaction,
  Company,
  WebhookEvent,
} from '@/database/entities';
import { SubscriptionsController } from './subscriptions.controller';
import { WebhooksController } from './webhooks.controller';
import { SubscriptionsService } from './subscriptions.service';
import { StripeService } from './stripe.service';
import { WebhookService } from './webhook.service';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subscription,
      Transaction,
      Company,
      WebhookEvent,
    ]),
    PlansModule,
  ],
  controllers: [SubscriptionsController, WebhooksController],
  providers: [SubscriptionsService, StripeService, WebhookService],
  exports: [SubscriptionsService, StripeService, WebhookService],
})
export class SubscriptionsModule {}
