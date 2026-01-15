import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { ScheduleData } from '../../database/entities';
import { ScheduleFile } from '../../database/entities';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { QueryOptions, Paginate } from '../../common/query-options';
import { UserProfile } from '@/database/entities/user-profile.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';
import { multerMemoryConfig } from './multer.config';
import {
  SaveScheduleConfigDto,
  ImportScheduleDto,
  ImportResultDto,
} from './dto/schedule-import.dto';

@ApiTags('schedule')
@Controller('schedule')
@ApiBearerAuth('JWT-auth')
@Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // ===== IMPORT ENDPOINTS =====

  @Post('config')
  @Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
  @ApiOperation({ summary: 'Save schedule file configuration' })
  @ApiResponse({ status: 201, description: 'Configuration saved successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async saveConfig(
    @AuthUser() user: UserProfile,
    @Body() dto: SaveScheduleConfigDto,
  ): Promise<{ success: boolean; data: ScheduleFile }> {
    const scheduleFile = await this.scheduleService.saveConfig(
      user.companyId,
      user.id,
      dto,
    );
    return { success: true, data: scheduleFile };
  }

  @Post('import')
  @Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
  @UseInterceptors(FileInterceptor('file', multerMemoryConfig))
  @ApiOperation({ summary: 'Upload and import schedule file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel or CSV file to import',
        },
        scheduleFileId: {
          type: 'string',
          format: 'uuid',
          description: 'Optional schedule file ID to associate with',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Import completed successfully',
    type: ImportResultDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file or no data found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async importFile(
    @AuthUser() user: UserProfile,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ImportScheduleDto,
  ): Promise<ImportResultDto> {
    if (!file && !body.fileData) {
      throw new BadRequestException('File or fileData is required');
    }

    return this.scheduleService.importSchedule(
      user.companyId,
      user.id,
      file,
      body.fileData,
      body.scheduleFileId,
    );
  }

  // ===== QUERY ENDPOINTS =====

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
