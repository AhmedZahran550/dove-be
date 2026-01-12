import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { CreateLocationDto } from './dto/location.dto';
import { AuthUserDto } from '../auth/dto/auth-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';

@ApiTags('locations')
@Controller('locations')
@ApiBearerAuth('JWT-auth')
@Roles(Role.COMPANY_ADMIN)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new location' })
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
  @ApiOperation({ summary: 'Get all locations for current company' })
  async findAll(@AuthUser() user: AuthUserDto) {
    return this.locationsService.findByCompany(user.companyId);
  }
}
