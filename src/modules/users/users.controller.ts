import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserProfile } from '../../database/entities';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';
import { UsersSwagger } from '@/swagger/users.swagger';
import { UpdateUserDto } from './dto/user.dto';

import { Cacheable, CacheEvict } from '@/common/decorators/cache.decorator';
import { Paginate, QueryOptions } from '@/common/query-options';

@ApiTags('users')
@Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
@Controller('users')
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @Cacheable({ key: 'users:me:{{user.id}}', ttl: 300 })
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@AuthUser() user: UserProfile) {
    return this.usersService.findById(user.id);
  }

  @Get()
  @Cacheable({ key: 'users:all', ttl: 60 })
  @ApiOperation({ summary: 'Get all users in company' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @AuthUser() user: UserProfile,
    @Paginate() query: QueryOptions,
  ) {
    return this.usersService.findByCompany(user.companyId, query);
  }

  @Get(':id')
  @Cacheable({ key: 'users:{{id}}', ttl: 300 })
  @UsersSwagger.findOne()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @CacheEvict('users:me:{{id}}', 'users:all', 'users:{{id}}')
  @UsersSwagger.update()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @CacheEvict('users:all', 'users:{{id}}')
  @UsersSwagger.remove()
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
