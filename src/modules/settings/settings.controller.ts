import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { RejectionCategory } from '../../database/entities';
import { RejectionReason } from '../../database/entities';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities';

@ApiTags('settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Rejection Categories
  @Get('rejection-categories')
  @ApiOperation({ summary: 'Get all rejection categories' })
  @ApiQuery({ name: 'department_id', required: false })
  async getCategories(
    @CurrentUser() user: User,
    @Query('department_id') departmentId?: string,
  ): Promise<RejectionCategory[]> {
    return this.settingsService.findCategories(user.company_id, departmentId);
  }

  @Get('rejection-categories/:id')
  @ApiOperation({ summary: 'Get a rejection category by ID' })
  async getCategoryById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<RejectionCategory> {
    return this.settingsService.findCategoryById(id, user.company_id);
  }

  @Post('rejection-categories')
  @ApiOperation({ summary: 'Create a rejection category' })
  async createCategory(
    @Body() data: Partial<RejectionCategory>,
    @CurrentUser() user: User,
  ): Promise<RejectionCategory> {
    return this.settingsService.createCategory(user.company_id, data);
  }

  @Patch('rejection-categories/:id')
  @ApiOperation({ summary: 'Update a rejection category' })
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: Partial<RejectionCategory>,
    @CurrentUser() user: User,
  ): Promise<RejectionCategory> {
    return this.settingsService.updateCategory(id, user.company_id, data);
  }

  @Delete('rejection-categories/:id')
  @ApiOperation({ summary: 'Delete a rejection category' })
  async deleteCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean }> {
    await this.settingsService.deleteCategory(id, user.company_id);
    return { success: true };
  }

  // Rejection Reasons
  @Get('rejection-reasons')
  @ApiOperation({ summary: 'Get all rejection reasons' })
  @ApiQuery({ name: 'category_id', required: false })
  async getReasons(
    @CurrentUser() user: User,
    @Query('category_id') categoryId?: string,
  ): Promise<RejectionReason[]> {
    return this.settingsService.findReasons(user.company_id, categoryId);
  }

  @Get('rejection-reasons/:id')
  @ApiOperation({ summary: 'Get a rejection reason by ID' })
  async getReasonById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<RejectionReason> {
    return this.settingsService.findReasonById(id, user.company_id);
  }

  @Post('rejection-reasons')
  @ApiOperation({ summary: 'Create a rejection reason' })
  async createReason(
    @Body() data: Partial<RejectionReason>,
    @CurrentUser() user: User,
  ): Promise<RejectionReason> {
    return this.settingsService.createReason(user.company_id, data);
  }

  @Patch('rejection-reasons/:id')
  @ApiOperation({ summary: 'Update a rejection reason' })
  async updateReason(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: Partial<RejectionReason>,
    @CurrentUser() user: User,
  ): Promise<RejectionReason> {
    return this.settingsService.updateReason(id, user.company_id, data);
  }

  @Delete('rejection-reasons/:id')
  @ApiOperation({ summary: 'Delete a rejection reason' })
  async deleteReason(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean }> {
    await this.settingsService.deleteReason(id, user.company_id);
    return { success: true };
  }
}

