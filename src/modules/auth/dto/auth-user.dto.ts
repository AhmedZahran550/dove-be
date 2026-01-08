import { Role } from '../role.model';

export class AuthUserDto {
  constructor(user?: Partial<AuthUserDto>) {
    Object.assign(this, user);
  }

  id?: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  mobile: string;
  familyId: string;
  disabled?: boolean;
  isFamilyManager?: boolean;
  locked?: boolean;
  lockedAt?: Date;
  roles: Role[];
  branchId?: string;
  providerId?: string;
  customerId?: string;
  mobileVerified?: boolean;
  identityId?: string;
}
