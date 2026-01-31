import { UseGuards, applyDecorators } from '@nestjs/common';
import { CompanyAccessGuard } from '../guards/company-access.guard';

export function ValidateCompanyAccess() {
  return applyDecorators(UseGuards(CompanyAccessGuard));
}
