import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Subscription } from '@/database/entities';
import { SubscriptionStatus } from '@/database/entities/subscription.entity';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.companyId) {
      throw new ForbiddenException('User not associated with a company');
    }

    // Get active subscription for the company
    const subscription = await this.subscriptionsRepository.findOne({
      where: {
        companyId: user.companyId,
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['plan'],
    });

    if (!subscription) {
      throw new ForbiddenException(
        'Your company does not have an active subscription. Please subscribe to continue.',
      );
    }

    // Check if subscription is expired (for trials)
    if (subscription.endDate && subscription.endDate < new Date()) {
      throw new ForbiddenException(
        'Your subscription has expired. Please renew to continue.',
      );
    }

    // Attach subscription to request for downstream use
    request.subscription = subscription;

    return true;
  }
}
