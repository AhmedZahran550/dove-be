import {
  Controller,
  Get,
  Patch,
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
import { ScheduleService } from './schedule.service';
import { ScheduleData } from '../../database/entities';
import { ScheduleFile } from '../../database/entities';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities';

@ApiTags('schedule')
@Controller('schedule')
@UseGuards(JwtAuthGuard)
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
  async findScheduleData(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('department') department?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @CurrentUser() user?: User,
  ) {
    return this.scheduleService.findScheduleData(user!.company_id, {
      page,
      limit,
      department,
      status,
      search,
    });
  }

  @Get('data/department/:department')
  @ApiOperation({ summary: 'Get schedule data for a specific department' })
  async findByDepartment(
    @Param('department') department: string,
    @CurrentUser() user: User,
  ): Promise<ScheduleData[]> {
    return this.scheduleService.findScheduleDataByDepartment(
      user.company_id,
      department,
    );
  }

  @Get('data/wo/:woId')
  @ApiOperation({ summary: 'Get schedule data by work order ID' })
  async findByWoId(
    @Param('woId') woId: string,
    @CurrentUser() user: User,
  ): Promise<ScheduleData | null> {
    return this.scheduleService.findScheduleDataByWoId(woId, user.company_id);
  }

  @Get('data/:id')
  @ApiOperation({ summary: 'Get schedule data by ID' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<ScheduleData> {
    return this.scheduleService.findScheduleDataById(id, user.company_id);
  }

  @Patch('data/:id')
  @ApiOperation({ summary: 'Update schedule data' })
  async updateScheduleData(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<ScheduleData>,
    @CurrentUser() user: User,
  ): Promise<ScheduleData> {
    return this.scheduleService.updateScheduleData(
      id,
      user.company_id,
      updateData,
    );
  }

  @Get('departments')
  @ApiOperation({ summary: 'Get available departments from schedule data' })
  async getDepartments(@CurrentUser() user: User): Promise<string[]> {
    return this.scheduleService.getAvailableDepartments(user.company_id);
  }

  @Get('files')
  @ApiOperation({ summary: 'Get all schedule files' })
  async getScheduleFiles(@CurrentUser() user: User): Promise<ScheduleFile[]> {
    return this.scheduleService.getScheduleFiles(user.company_id);
  }

  @Get('files/active')
  @ApiOperation({ summary: 'Get the active schedule file' })
  async getActiveScheduleFile(
    @CurrentUser() user: User,
  ): Promise<ScheduleFile | null> {
    return this.scheduleService.getActiveScheduleFile(user.company_id);
  }
}

