import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CompanyAccessGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as any;
    const companyId = request.params.id;

    if (!user || !companyId) return true; // If no user or no param, let other guards handle or fail safely?
    // Actually LocationAccessGuard returned false.
    // "if (!user || !locationId) return false;"

    // Let's stick to the pattern:
    if (!user || !companyId) return false;

    return user.companyId === companyId;
  }
}
