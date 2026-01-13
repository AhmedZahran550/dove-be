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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { RejectionCategory } from '../../database/entities';
import { RejectionReason } from '../../database/entities';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserProfile } from '../../database/entities';

@ApiTags('settings')
@Controller('settings')
@ApiBearerAuth('JWT-auth')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Rejection Categories
  @Get('rejection-categories')
  @ApiOperation({ summary: 'Get all rejection categories' })
  @ApiQuery({ name: 'department_id', required: false })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCategories(
    @AuthUser() user: UserProfile,
    @Query('department_id') departmentId?: string,
  ): Promise<RejectionCategory[]> {
    return this.settingsService.findCategories(user.companyId, departmentId);
  }

  @Get('rejection-categories/:id')
  @ApiOperation({ summary: 'Get a rejection category by ID' })
  @ApiResponse({ status: 200, description: 'Category found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getCategoryById(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<RejectionCategory> {
    return this.settingsService.findCategoryById(id, user.companyId);
  }

  @Post('rejection-categories')
  @ApiOperation({ summary: 'Create a rejection category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createCategory(
    @Body() data: Partial<RejectionCategory>,
    @AuthUser() user: UserProfile,
  ): Promise<RejectionCategory> {
    return this.settingsService.createCategory(user.companyId, data);
  }

  @Patch('rejection-categories/:id')
  @ApiOperation({ summary: 'Update a rejection category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: Partial<RejectionCategory>,
    @AuthUser() user: UserProfile,
  ): Promise<RejectionCategory> {
    return this.settingsService.updateCategory(id, user.companyId, data);
  }

  @Delete('rejection-categories/:id')
  @ApiOperation({ summary: 'Delete a rejection category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async deleteCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<{ success: boolean }> {
    await this.settingsService.deleteCategory(id, user.companyId);
    return { success: true };
  }

  // Rejection Reasons
  @Get('rejection-reasons')
  @ApiOperation({ summary: 'Get all rejection reasons' })
  @ApiQuery({ name: 'category_id', required: false })
  @ApiResponse({ status: 200, description: 'Reasons retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getReasons(
    @AuthUser() user: UserProfile,
    @Query('category_id') categoryId?: string,
  ): Promise<RejectionReason[]> {
    return this.settingsService.findReasons(user.companyId, categoryId);
  }

  @Get('rejection-reasons/:id')
  @ApiOperation({ summary: 'Get a rejection reason by ID' })
  @ApiResponse({ status: 200, description: 'Reason found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Reason not found' })
  async getReasonById(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<RejectionReason> {
    return this.settingsService.findReasonById(id, user.companyId);
  }

  @Post('rejection-reasons')
  @ApiOperation({ summary: 'Create a rejection reason' })
  @ApiResponse({ status: 201, description: 'Reason created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createReason(
    @Body() data: Partial<RejectionReason>,
    @AuthUser() user: UserProfile,
  ): Promise<RejectionReason> {
    return this.settingsService.createReason(user.companyId, data);
  }

  @Patch('rejection-reasons/:id')
  @ApiOperation({ summary: 'Update a rejection reason' })
  @ApiResponse({ status: 200, description: 'Reason updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Reason not found' })
  async updateReason(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: Partial<RejectionReason>,
    @AuthUser() user: UserProfile,
  ): Promise<RejectionReason> {
    return this.settingsService.updateReason(id, user.companyId, data);
  }

  @Delete('rejection-reasons/:id')
  @ApiOperation({ summary: 'Delete a rejection reason' })
  @ApiResponse({ status: 200, description: 'Reason deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Reason not found' })
  async deleteReason(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<{ success: boolean }> {
    await this.settingsService.deleteReason(id, user.companyId);
    return { success: true };
  }
}
