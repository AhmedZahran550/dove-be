import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LocationsSwagger } from '@/swagger/locations.swagger';
import { LocationsService } from './locations.service';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { CreateLocationDto } from './dto/location.dto';
import { AuthUserDto } from '../auth/dto/auth-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';
import { Paginate, QueryOptions } from '@/common/query-options';

import { Cacheable, CacheEvict } from '@/common/decorators/cache.decorator';

@ApiTags('locations')
@Controller('locations')
@ApiBearerAuth('JWT-auth')
@Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @CacheEvict('locations:all')
  @LocationsSwagger.create()
  async create(
    @AuthUser() user: AuthUserDto,
    @Body() createLocationDto: CreateLocationDto,
  ) {
    createLocationDto.company = {
      id: user.companyId,
    };
    return this.locationsService.create(createLocationDto);
  }

  @Get()
  @Cacheable({ key: 'locations:all', ttl: 60 })
  @LocationsSwagger.findAll()
  async findAll(
    @AuthUser() user: AuthUserDto,
    @Paginate() query: QueryOptions,
  ) {
    return this.locationsService.findByCompany(user.companyId, query);
  }
}
