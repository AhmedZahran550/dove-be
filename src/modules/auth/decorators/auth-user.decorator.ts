import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserProfile } from '../../../database/entities';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserProfile => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserProfile;
  },
);
