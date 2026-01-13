import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserProfile } from '../../database/entities';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';

@ApiTags('companies')
@Controller('companies')
@ApiBearerAuth('JWT-auth')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Roles(Role.COMPANY_ADMIN)
  @Get('current')
  @ApiOperation({ summary: 'Get current user company' })
  @ApiResponse({ status: 200, description: 'Company retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getCurrentCompany(@AuthUser() user: UserProfile) {
    return this.companiesService.findById(user.companyId);
  }
}
