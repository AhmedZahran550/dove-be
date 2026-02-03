import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateCheckoutDto, ChangePlanDto } from './dto';
import { SubscriptionsSwagger } from '@/swagger/subscriptions.swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserProfile } from '@/database/entities';

@ApiTags('subscriptions')
@Controller('subscriptions')
@ApiBearerAuth('JWT-auth')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN, Role.ADMIN, Role.SUPER_ADMIN)
  @Get('plans/company')
  @SubscriptionsSwagger.getPlans()
  async getPlansForCompany(@AuthUser() user: UserProfile) {
    return this.subscriptionsService.getPlansForCompany(user.companyId);
  }

  @Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN, Role.ADMIN, Role.SUPER_ADMIN)
  @Get('company/current')
  @SubscriptionsSwagger.getCurrentSubscription()
  async getCurrentSubscription(@AuthUser() user: UserProfile) {
    return this.subscriptionsService.getCurrentSubscription(user.companyId);
  }

  @Roles(Role.COMPANY_ADMIN)
  @Post('company/free-trial')
  @SubscriptionsSwagger.startFreeTrial()
  async startFreeTrial(@AuthUser() user: UserProfile) {
    return this.subscriptionsService.startFreeTrial(user.companyId, user.id);
  }

  @Roles(Role.COMPANY_ADMIN)
  @Post('company/checkout')
  @SubscriptionsSwagger.createCheckout()
  async createCheckout(
    @AuthUser() user: UserProfile,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.subscriptionsService.createCheckoutSession(
      user.companyId,
      user.id,
      dto,
    );
  }

  @Roles(Role.COMPANY_ADMIN)
  @Post('company/cancel')
  @SubscriptionsSwagger.cancelSubscription()
  async cancelSubscription(@AuthUser() user: UserProfile) {
    return this.subscriptionsService.cancelSubscription(
      user.companyId,
      user.id,
    );
  }

  @Roles(Role.COMPANY_ADMIN)
  @Post('company/change-plan')
  @SubscriptionsSwagger.changePlan()
  async changePlan(@AuthUser() user: UserProfile, @Body() dto: ChangePlanDto) {
    return this.subscriptionsService.changePlan(user.companyId, user.id, dto);
  }

  @Roles(Role.COMPANY_ADMIN)
  @Post('company/portal')
  @SubscriptionsSwagger.createBillingPortal()
  async createBillingPortal(@AuthUser() user: UserProfile) {
    return this.subscriptionsService.createBillingPortalSession(user.companyId);
  }

  @Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN, Role.ADMIN, Role.SUPER_ADMIN)
  @Get('company/transactions')
  @SubscriptionsSwagger.getTransactions()
  async getTransactionHistory(@AuthUser() user: UserProfile) {
    return this.subscriptionsService.getTransactionHistory(user.companyId);
  }

  @Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN, Role.ADMIN, Role.SUPER_ADMIN)
  @Get('company/feature/:name')
  @SubscriptionsSwagger.checkFeature()
  async checkFeatureAccess(
    @AuthUser() user: UserProfile,
    @Param('name') featureName: string,
  ) {
    const hasAccess = await this.subscriptionsService.checkFeatureAccess(
      user.companyId,
      featureName,
    );
    return { feature: featureName, hasAccess };
  }
}
