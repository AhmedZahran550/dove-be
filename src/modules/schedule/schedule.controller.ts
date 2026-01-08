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
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { User } from '../../database/entities';
import { QueryOptions, Paginate } from '../../common/query-options';

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
    @Paginate() query: QueryOptions,
    @AuthUser() user?: User,
  ) {
    return this.scheduleService.findScheduleData(user!.companyId, query);
  }

  @Get('data/department/:department')
  @ApiOperation({ summary: 'Get schedule data for a specific department' })
  async findByDepartment(
    @Param('department') department: string,
    @AuthUser() user: User,
  ): Promise<ScheduleData[]> {
    return this.scheduleService.findScheduleDataByDepartment(
      user.companyId,
      department,
    );
  }

  @Get('data/wo/:woId')
  @ApiOperation({ summary: 'Get schedule data by work order ID' })
  async findByWoId(
    @Param('woId') woId: string,
    @AuthUser() user: User,
  ): Promise<ScheduleData | null> {
    return this.scheduleService.findScheduleDataByWoId(woId, user.companyId);
  }

  @Get('data/:id')
  @ApiOperation({ summary: 'Get schedule data by ID' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: User,
  ): Promise<ScheduleData> {
    return this.scheduleService.findScheduleDataById(id, user.companyId);
  }

  @Patch('data/:id')
  @ApiOperation({ summary: 'Update schedule data' })
  async updateScheduleData(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<ScheduleData>,
    @AuthUser() user: User,
  ): Promise<ScheduleData> {
    return this.scheduleService.updateScheduleData(
      id,
      user.companyId,
      updateData,
    );
  }

  @Get('departments')
  @ApiOperation({ summary: 'Get available departments from schedule data' })
  async getDepartments(@AuthUser() user: User): Promise<string[]> {
    return this.scheduleService.getAvailableDepartments(user.companyId);
  }

  @Get('files')
  @ApiOperation({ summary: 'Get all schedule files' })
  async getScheduleFiles(@AuthUser() user: User): Promise<ScheduleFile[]> {
    return this.scheduleService.getScheduleFiles(user.companyId);
  }

  @Get('files/active')
  @ApiOperation({ summary: 'Get the active schedule file' })
  async getActiveScheduleFile(
    @AuthUser() user: User,
  ): Promise<ScheduleFile | null> {
    return this.scheduleService.getActiveScheduleFile(user.companyId);
  }
}
