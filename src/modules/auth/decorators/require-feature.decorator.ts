import { SetMetadata } from '@nestjs/common';

export const FEATURE_KEY = 'requiredFeature';

/**
 * Decorator to specify a required feature for an endpoint.
 * Used with FeatureGuard to check if the company's plan includes the feature.
 *
 * @example
 * @RequireFeature('api_access')
 * @Get('protected-endpoint')
 * async protectedEndpoint() { ... }
 */
export const RequireFeature = (feature: string) =>
  SetMetadata(FEATURE_KEY, feature);
