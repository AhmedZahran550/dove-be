import {
  Controller,
  Get,
  Patch,
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
  ApiParam,
} from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { ScheduleData } from '../../database/entities';
import { ScheduleFile } from '../../database/entities';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { QueryOptions, Paginate } from '../../common/query-options';
import { UserProfile } from '@/database/entities/user-profile.entity';

@ApiTags('schedule')
@Controller('schedule')
@ApiBearerAuth('JWT-auth')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('data')
  @ApiOperation({ summary: 'Get schedule data with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'department', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Schedule data retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findScheduleData(
    @Paginate() query: QueryOptions,
    @AuthUser() user?: UserProfile,
  ) {
    return this.scheduleService.findScheduleData(user!.companyId, query);
  }

  @Get('data/department/:department')
  @ApiOperation({ summary: 'Get schedule data for a specific department' })
  @ApiParam({ name: 'department', description: 'Department name' })
  @ApiResponse({
    status: 200,
    description: 'Department schedule data retrieved',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByDepartment(
    @Param('department') department: string,
    @AuthUser() user: UserProfile,
  ): Promise<ScheduleData[]> {
    return this.scheduleService.findScheduleDataByDepartment(
      user.companyId,
      department,
    );
  }

  @Get('data/wo/:woId')
  @ApiOperation({ summary: 'Get schedule data by work order ID' })
  @ApiParam({ name: 'woId', description: 'Work order ID' })
  @ApiResponse({ status: 200, description: 'Schedule data found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Schedule data not found' })
  async findByWoId(
    @Param('woId') woId: string,
    @AuthUser() user: UserProfile,
  ): Promise<ScheduleData | null> {
    return this.scheduleService.findScheduleDataByWoId(woId, user.companyId);
  }

  @Get('data/:id')
  @ApiOperation({ summary: 'Get schedule data by ID' })
  @ApiResponse({ status: 200, description: 'Schedule data found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Schedule data not found' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<ScheduleData> {
    return this.scheduleService.findScheduleDataById(id, user.companyId);
  }

  @Patch('data/:id')
  @ApiOperation({ summary: 'Update schedule data' })
  @ApiResponse({
    status: 200,
    description: 'Schedule data updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Schedule data not found' })
  async updateScheduleData(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<ScheduleData>,
    @AuthUser() user: UserProfile,
  ): Promise<ScheduleData> {
    return this.scheduleService.updateScheduleData(
      id,
      user.companyId,
      updateData,
    );
  }

  @Get('departments')
  @ApiOperation({ summary: 'Get available departments from schedule data' })
  @ApiResponse({
    status: 200,
    description: 'Departments retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDepartments(@AuthUser() user: UserProfile): Promise<string[]> {
    return this.scheduleService.getAvailableDepartments(user.companyId);
  }

  @Get('files')
  @ApiOperation({ summary: 'Get all schedule files' })
  @ApiResponse({
    status: 200,
    description: 'Schedule files retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getScheduleFiles(
    @AuthUser() user: UserProfile,
  ): Promise<ScheduleFile[]> {
    return this.scheduleService.getScheduleFiles(user.companyId);
  }

  @Get('files/active')
  @ApiOperation({ summary: 'Get the active schedule file' })
  @ApiResponse({ status: 200, description: 'Active schedule file retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getActiveScheduleFile(
    @AuthUser() user: UserProfile,
  ): Promise<ScheduleFile | null> {
    return this.scheduleService.getActiveScheduleFile(user.companyId);
  }
}
