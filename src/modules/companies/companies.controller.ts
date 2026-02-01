import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CompaniesSwagger } from '@/swagger/companies.swagger';
import { UpdateCompanyDto } from './dto/company.dto';
import { CompaniesService } from './companies.service';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserProfile } from '../../database/entities';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';
import { ValidateCompanyAccess } from '../auth/decorators/validate-company-access.decorator';

import { Cacheable, CacheEvict } from '@/common/decorators/cache.decorator';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
  @Get('current')
  @Cacheable({ key: 'companies:current:{{user.companyId}}', ttl: 300 })
  @CompaniesSwagger.getCurrent()
  async getCurrentCompany(@AuthUser() user: UserProfile) {
    return this.companiesService.findById(user.companyId);
  }

  @Roles(Role.COMPANY_ADMIN)
  @Put(':id')
  @ValidateCompanyAccess()
  @CacheEvict('companies:current:{{id}}')
  @CompaniesSwagger.update()
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(id, updateCompanyDto);
  }
}
