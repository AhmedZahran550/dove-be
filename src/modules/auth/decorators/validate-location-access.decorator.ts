import { UseGuards, applyDecorators } from '@nestjs/common';
import { LocationAccessGuard } from '../guards/location-access.guard';

export function ValidateLocationAccess() {
  return applyDecorators(UseGuards(LocationAccessGuard));
}
