import { Role } from '../role.model';

export class AuthUserDto {
  constructor(user?: Partial<AuthUserDto>) {
    Object.assign(this, user);
  }

  id?: string;
  email: string;
  firstName?: string;
  roles: Role[];
  lastName?: string;
  fullName?: string;
  companyId?: string;
  locationId?: string;
  needsProfileSetup?: boolean;
  needsCompanyOnboarding?: boolean;
}
