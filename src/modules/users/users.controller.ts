import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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
import { UpdateUserPreferenceDto } from './dto/user-preferences.dto';

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

  @Get('me/preferences')
  @UsersSwagger.getPreferences()
  async getPreferences(@AuthUser() user: UserProfile) {
    const prefs = await this.usersService.getPreferences(user.id);
    return { success: true, preferences: prefs };
  }

  @Put('preferences')
  @UsersSwagger.updatePreference()
  async updatePreferences(
    @AuthUser() user: UserProfile,
    @Body() dto: UpdateUserPreferenceDto,
  ) {
    const updated = await this.usersService.updatePreference(
      user.id,
      dto.key,
      dto.value,
    );
    return { success: true, data: updated };
  }

  @Delete('preferences')
  @UsersSwagger.deletePreference()
  async deletePreferences(
    @AuthUser() user: UserProfile,
    @Query('key') key: string,
  ) {
    await this.usersService.deletePreference(user.id, key);
    return { success: true };
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
