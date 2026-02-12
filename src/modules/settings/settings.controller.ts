import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsSwagger } from '@/swagger/settings.swagger';
import { SettingsService } from './settings.service';
import { RejectionCategory } from '../../database/entities';
import { RejectionReason } from '../../database/entities';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserProfile } from '../../database/entities';

import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';

@ApiTags('settings')
@Controller('settings')
@ApiBearerAuth('JWT-auth')
@Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Rejection Categories
  @Get('rejection-categories')
  @SettingsSwagger.getCategories()
  async getCategories(
    @AuthUser() user: UserProfile,
    @Query('departmentId') departmentId?: string,
  ): Promise<RejectionCategory[]> {
    return this.settingsService.findCategories(user.companyId, departmentId);
  }

  @Get('rejection-categories/:id')
  @SettingsSwagger.getCategoryById()
  async getCategoryById(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<RejectionCategory> {
    return this.settingsService.findCategoryById(id, user.companyId);
  }

  @Post('rejection-categories')
  @SettingsSwagger.createCategory()
  async createCategory(
    @Body() data: Partial<RejectionCategory>,
    @AuthUser() user: UserProfile,
  ): Promise<RejectionCategory> {
    return this.settingsService.createCategory(user.companyId, data);
  }

  @Patch('rejection-categories/:id')
  @SettingsSwagger.updateCategory()
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: Partial<RejectionCategory>,
    @AuthUser() user: UserProfile,
  ): Promise<RejectionCategory> {
    return this.settingsService.updateCategory(id, user.companyId, data);
  }

  @Delete('rejection-categories/:id')
  @SettingsSwagger.deleteCategory()
  async deleteCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<{ success: boolean }> {
    await this.settingsService.deleteCategory(id, user.companyId);
    return { success: true };
  }

  // Rejection Reasons
  @Get('rejection-reasons')
  @SettingsSwagger.getReasons()
  async getReasons(
    @AuthUser() user: UserProfile,
    @Query('categoryId') categoryId?: string,
  ): Promise<RejectionReason[]> {
    return this.settingsService.findReasons(user.companyId, categoryId);
  }

  @Get('rejection-reasons/:id')
  @SettingsSwagger.getReasonById()
  async getReasonById(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<RejectionReason> {
    return this.settingsService.findReasonById(id, user.companyId);
  }

  @Post('rejection-reasons')
  @SettingsSwagger.createReason()
  async createReason(
    @Body() data: Partial<RejectionReason>,
    @AuthUser() user: UserProfile,
  ): Promise<RejectionReason> {
    return this.settingsService.createReason(user.companyId, data);
  }

  @Patch('rejection-reasons/:id')
  @SettingsSwagger.updateReason()
  async updateReason(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: Partial<RejectionReason>,
    @AuthUser() user: UserProfile,
  ): Promise<RejectionReason> {
    return this.settingsService.updateReason(id, user.companyId, data);
  }

  @Delete('rejection-reasons/:id')
  @SettingsSwagger.deleteReason()
  async deleteReason(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<{ success: boolean }> {
    await this.settingsService.deleteReason(id, user.companyId);
    return { success: true };
  }
}
