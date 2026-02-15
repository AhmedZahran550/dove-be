import {
  Controller,
  Get,
  Post,
  Put,
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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ScheduleSwagger } from '@/swagger/schedule.swagger';
import { ScheduleService } from './schedule.service';
import { ScheduleData, CompanyColumnMapping } from '../../database/entities';
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
import {
  CreateColumnMappingDto,
  UpdateColumnMappingDto,
} from './dto/schedule-mapping.dto';

@ApiTags('schedule')
@Controller('schedule')
@ApiBearerAuth('JWT-auth')
@Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // ===== IMPORT ENDPOINTS =====

  @Post('config')
  @Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
  @ScheduleSwagger.saveConfig()
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
  @ScheduleSwagger.importFile()
  async importFile(
    @AuthUser() user: UserProfile,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ImportScheduleDto,
  ): Promise<ImportResultDto> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.scheduleService.importSchedule(
      user.companyId,
      user.id,
      file,
      body.scheduleFileId,
    );
  }

  // ===== QUERY ENDPOINTS =====

  @Get(['data', 'list'])
  @ScheduleSwagger.findScheduleData()
  async findScheduleData(
    @Paginate() query: QueryOptions,
    @AuthUser() user?: UserProfile,
  ) {
    return this.scheduleService.findScheduleData(user.companyId, query);
  }

  @Get('data/department/:department')
  @ScheduleSwagger.findByDepartment()
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
  @ScheduleSwagger.findByWoId()
  async findByWoId(
    @Param('woId') woId: string,
    @AuthUser() user: UserProfile,
  ): Promise<ScheduleData | null> {
    return this.scheduleService.findScheduleDataByWoId(woId, user.companyId);
  }

  @Get('data/:id')
  @ScheduleSwagger.findById()
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<ScheduleData> {
    return this.scheduleService.findScheduleDataById(id, user.companyId);
  }

  @Patch('data/:id')
  @ScheduleSwagger.updateScheduleData()
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
  @ScheduleSwagger.getDepartments()
  async getDepartments(@AuthUser() user: UserProfile): Promise<string[]> {
    return this.scheduleService.getAvailableDepartments(user.companyId);
  }

  @Get('files')
  @ScheduleSwagger.getScheduleFiles()
  async getScheduleFiles(
    @AuthUser() user: UserProfile,
  ): Promise<ScheduleFile[]> {
    return this.scheduleService.getScheduleFiles(user.companyId);
  }

  @Get('department-summary')
  @Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
  @ScheduleSwagger.getDepartmentSummary()
  async getDepartmentSummary(@AuthUser() user: UserProfile) {
    return this.scheduleService.getDepartmentSummary(user.companyId);
  }

  @Get('columns')
  @ScheduleSwagger.getScheduleColumns()
  async getScheduleColumns(@AuthUser() user: UserProfile) {
    const columns = await this.scheduleService.getScheduleColumns(
      user.companyId,
    );
    return { data: columns };
  }

  @Get('config')
  @ScheduleSwagger.getScheduleSyncConfig()
  async getScheduleSyncConfig(@AuthUser() user: UserProfile) {
    return this.scheduleService.getScheduleSyncConfig(user.companyId);
  }

  @Post('sync')
  @ScheduleSwagger.triggerScheduleSync()
  async triggerScheduleSync(@AuthUser() user: UserProfile) {
    return this.scheduleService.triggerScheduleSync(user.companyId);
  }

  @Get('column-mappings')
  @Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN, Role.OPERATOR, Role.USER)
  @ScheduleSwagger.getColumnMappings()
  async getColumnMappings(@AuthUser() user: UserProfile) {
    const mappings = await this.scheduleService.getColumnMappings(
      user.companyId,
    );
    return { data: mappings };
  }

  @Post('column-mappings')
  @Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
  @ScheduleSwagger.createColumnMapping()
  async createColumnMapping(
    @AuthUser() user: UserProfile,
    @Body() dto: CreateColumnMappingDto,
  ) {
    const mapping = await this.scheduleService.createColumnMapping(
      user.companyId,
      dto,
    );
    return { data: mapping };
  }

  @Put('column-mappings/:id')
  @Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
  @ScheduleSwagger.updateColumnMapping()
  async updateColumnMapping(
    @AuthUser() user: UserProfile,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateColumnMappingDto,
  ) {
    const mapping = await this.scheduleService.updateColumnMapping(
      id,
      user.companyId,
      dto,
    );
    return { data: mapping };
  }

  @Get(':woNumber')
  @Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN, Role.OPERATOR, Role.USER)
  async getScheduleByWoNumber(
    @Param('woNumber') woNumber: string,
    @AuthUser() user: UserProfile,
  ): Promise<{ success: boolean; data: { schedule: ScheduleData | null } }> {
    const schedule = await this.scheduleService.findScheduleDataByWoId(
      woNumber,
      user.companyId,
    );
    return {
      success: true,
      data: {
        schedule,
      },
    };
  }

  @Get('files/active')
  @ScheduleSwagger.getActiveScheduleFile()
  async getActiveScheduleFile(
    @AuthUser() user: UserProfile,
  ): Promise<ScheduleFile | null> {
    return this.scheduleService.getActiveScheduleFile(user.companyId);
  }

  @Get(':id/time-segments')
  @Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN, Role.OPERATOR, Role.USER)
  @ScheduleSwagger.getTimeSegments()
  async getTimeSegments(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<{ success: boolean; data: any[] }> {
    const data = await this.scheduleService.getTimeSegmentsByScheduleId(
      id,
      user.companyId,
    );
    return {
      success: true,
      data,
    };
  }
}
