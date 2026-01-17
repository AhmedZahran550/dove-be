import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { FEATURE_KEY } from '../decorators/require-feature.decorator';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Get required feature from decorator
    const requiredFeature = this.reflector.getAllAndOverride<string>(
      FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredFeature) {
      // No feature requirement, allow access
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const subscription = request.subscription;

    if (!subscription || !subscription.plan) {
      throw new ForbiddenException(
        'No active subscription found. Please subscribe to access this feature.',
      );
    }

    // Check if the plan includes the required feature
    const features = subscription.plan.features || [];
    if (!features.includes(requiredFeature)) {
      throw new ForbiddenException(
        `Your current plan does not include the "${requiredFeature}" feature. Please upgrade your plan.`,
      );
    }

    return true;
  }
}
