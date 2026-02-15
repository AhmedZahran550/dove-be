import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import * as XLSX from 'xlsx';
import { ScheduleData } from '../../database/entities';
import { ScheduleFile } from '../../database/entities';
import { CompanyColumnMapping } from '../../database/entities';
import { QueryOptions } from '../../common/query-options';
import { Department } from '../../database/entities/department.entity';
import { SystemConfiguration } from '../../database/entities/system-configuration.entity';
import { TimeSegment } from '../../database/entities/time-segment.entity';
import { Equipment } from '../../database/entities/equipment.entity';
import { UserProfile } from '../../database/entities/user-profile.entity';
import {
  generateNormalizationRules,
  applyNormalization,
} from '../../utils/schedule-normalizer';
import {
  applyColumnMapping,
  getDefaultColumnMapping,
  transformToScheduleData,
} from '../../utils/column-mapping';
import {
  SaveScheduleConfigDto,
  ImportResultDto,
} from './dto/schedule-import.dto';
import {
  CreateColumnMappingDto,
  UpdateColumnMappingDto,
} from './dto/schedule-mapping.dto';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    @InjectRepository(ScheduleData)
    private scheduleDataRepository: Repository<ScheduleData>,
    @InjectRepository(ScheduleFile)
    private scheduleFileRepository: Repository<ScheduleFile>,
    @InjectRepository(CompanyColumnMapping)
    private columnMappingRepository: Repository<CompanyColumnMapping>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(SystemConfiguration)
    private systemConfigRepository: Repository<SystemConfiguration>,
    @InjectRepository(TimeSegment)
    private timeSegmentRepository: Repository<TimeSegment>,
  ) {}

  // ===== IMPORT METHODS =====

  /**
   * Save or update schedule file configuration
   */
  async saveConfig(
    companyId: string,
    userId: string,
    dto: SaveScheduleConfigDto,
  ): Promise<ScheduleFile> {
    // Check for existing active file with same name
    const existingFile = await this.scheduleFileRepository.findOne({
      where: { companyId, fileName: dto.fileName },
    });

    if (existingFile) {
      // Update existing
      Object.assign(existingFile, {
        sourceType: dto.sourceType || existingFile.sourceType,
        syncFrequency: dto.syncFrequency || existingFile.syncFrequency,
        autoSyncEnabled: dto.autoSyncEnabled ?? existingFile.autoSyncEnabled,
        publishToSchedulePage:
          dto.publishToSchedulePage ?? existingFile.publishToSchedulePage,
      });
      return this.scheduleFileRepository.save(existingFile);
    }

    // Create new schedule file record
    const scheduleFile = this.scheduleFileRepository.create({
      companyId,
      fileName: dto.fileName,
      sourceType: dto.sourceType || 'file_upload',
      syncFrequency: dto.syncFrequency || 'manual',
      autoSyncEnabled: dto.autoSyncEnabled ?? false,
      publishToSchedulePage: dto.publishToSchedulePage ?? true,
      isActive: true,
      uploadedBy: userId,
    });

    // Deactivate other files for this company
    await this.scheduleFileRepository.update(
      { companyId, isActive: true },
      { isActive: false },
    );

    return this.scheduleFileRepository.save(scheduleFile);
  }

  /**
   * Import schedule data from uploaded file
   */
  async importSchedule(
    companyId: string,
    userId: string,
    file?: Express.Multer.File,
    scheduleFileId?: string,
  ): Promise<ImportResultDto> {
    // 1. Read and parse file
    let workbook: XLSX.WorkBook;

    if (file) {
      workbook = XLSX.read(file.buffer, { type: 'buffer' });
    } else {
      throw new BadRequestException('No file or file data provided');
    }

    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: false });

    if (!jsonData || jsonData.length === 0) {
      throw new BadRequestException('No data rows found in the file');
    }

    this.logger.log(
      `Parsing ${jsonData.length} rows from sheet: ${firstSheetName}`,
    );

    // 2. Get source columns from first row
    const sourceColumns = Object.keys(jsonData[0]);

    // 3. Load or create company mapping
    let mapping = await this.columnMappingRepository.findOne({
      where: { companyId, isDefault: true, isActive: true },
    });

    let normalizationRules = mapping?.normalizationRules;

    if (!normalizationRules) {
      normalizationRules = generateNormalizationRules(sourceColumns);

      if (mapping) {
        mapping.normalizationRules = normalizationRules;
        mapping = await this.columnMappingRepository.save(mapping);
      } else {
        mapping = await this.columnMappingRepository.save({
          companyId,
          mappingName: 'Auto-Generated Mapping',
          normalizationRules,
          mappingConfig: getDefaultColumnMapping(),
          isActive: true,
          isDefault: true,
        });
      }
    }

    // 4. Generate import batch ID
    const importBatchId = `import_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    // 5. Process and transform rows
    const recordsToUpsert: Partial<ScheduleData>[] = [];
    let skippedCount = 0;

    for (const row of jsonData) {
      // Apply normalization
      const normalized = applyNormalization(row, normalizationRules);

      // Apply mapping
      const mapped = applyColumnMapping(normalized, mapping?.mappingConfig);

      // Transform to schedule data format
      const scheduleRecord = transformToScheduleData(
        mapped,
        companyId,
        scheduleFileId,
        importBatchId,
      );

      // Skip if no work order ID
      if (!scheduleRecord.woId || scheduleRecord.woId.trim() === '') {
        skippedCount++;
        continue;
      }

      // Store raw data for reference
      scheduleRecord.rawData = row;

      recordsToUpsert.push(scheduleRecord);
    }

    if (recordsToUpsert.length === 0) {
      throw new BadRequestException(
        'No valid records found. Ensure the file contains a work order ID column.',
      );
    }

    // 6. Efficiently calculate stats (one query instead of N)
    const woIds = recordsToUpsert.map((r) => r.woId);

    // We need to chunk the check for existing records to avoid parameter limit issues if thousands of records
    let existingCount = 0;
    const chunkSize = 1000;

    for (let i = 0; i < woIds.length; i += chunkSize) {
      const chunk = woIds.slice(i, i + chunkSize);
      if (chunk.length > 0) {
        const existingInChunk = await this.scheduleDataRepository.count({
          where: {
            companyId,
            woId: In(chunk) as any,
          },
        });
        existingCount += existingInChunk;
      }
    }

    const insertedCount = recordsToUpsert.length - existingCount;
    const updatedCount = existingCount;

    // 7. Bulk Upsert (one query per chunk to handle potential parameter limits)
    for (let i = 0; i < recordsToUpsert.length; i += chunkSize) {
      const chunk = recordsToUpsert.slice(i, i + chunkSize);
      await this.scheduleDataRepository.upsert(chunk, {
        conflictPaths: ['companyId', 'woId'],
        skipUpdateIfNoValuesChanged: true,
      });
    }

    // 7. Update mapping statistics
    await this.columnMappingRepository.update(mapping.id, {
      lastUsedAt: new Date(),
      successCount: () => 'success_count + 1',
    } as any);

    // 8. Update schedule file if provided
    if (scheduleFileId) {
      await this.scheduleFileRepository.update(scheduleFileId, {
        lastSyncedAt: new Date(),
      });
    }

    // 9. Get total count for stats
    const totalInDatabase = await this.scheduleDataRepository.count({
      where: { companyId },
    });

    this.logger.log(
      `Import complete: ${insertedCount} inserted, ${updatedCount} updated, ${skippedCount} skipped`,
    );

    return {
      success: true,
      importBatchId,
      scheduleFileId,
      stats: {
        totalRecordsInFile: jsonData.length,
        validRecords: recordsToUpsert.length,
        importedRecords: insertedCount,
        updatedRecords: updatedCount,
        skippedRecords: skippedCount,
        totalRecordsInDatabase: totalInDatabase,
      },
    };
  }

  // ===== EXISTING QUERY METHODS =====

  async findScheduleData(
    companyId: string,
    query: QueryOptions & {
      department?: string;
      status?: string;
      search?: string;
    },
  ) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 50, 200);
    const skip = (page - 1) * limit;

    const whereClause: any = { companyId: companyId };

    if (query.department) {
      whereClause.department = query.department;
    }
    if (query.status) {
      whereClause.status = query.status;
    }
    if (query.search) {
      whereClause.woId = ILike(`%${query.search}%`);
    }

    const [data, totalItems] = await this.scheduleDataRepository.findAndCount({
      where: whereClause,
      order: { sequence: 'ASC', woId: 'ASC' },
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        itemsPerPage: limit,
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findScheduleDataByDepartment(
    companyId: string,
    department: string,
  ): Promise<ScheduleData[]> {
    return this.scheduleDataRepository.find({
      where: { companyId: companyId, department },
      order: { sequence: 'ASC' },
    });
  }

  async findScheduleDataById(
    id: string,
    companyId: string,
  ): Promise<ScheduleData> {
    const scheduleData = await this.scheduleDataRepository.findOne({
      where: { id, companyId: companyId },
    });

    if (!scheduleData) {
      throw new NotFoundException(`Schedule data with ID ${id} not found`);
    }

    return scheduleData;
  }

  async findScheduleDataByWoId(
    woId: string,
    companyId: string,
  ): Promise<ScheduleData | null> {
    return this.scheduleDataRepository.findOne({
      where: { woId: woId, companyId: companyId },
    });
  }

  async getAvailableDepartments(companyId: string): Promise<string[]> {
    const result = await this.scheduleDataRepository
      .createQueryBuilder('sd')
      .select('DISTINCT sd.department', 'department')
      .where('sd.companyId = :companyId', { companyId })
      .andWhere('sd.department IS NOT NULL')
      .getRawMany();

    return result.map((r) => r.department).filter(Boolean);
  }

  async getScheduleFiles(companyId: string): Promise<ScheduleFile[]> {
    return this.scheduleFileRepository.find({
      where: { companyId: companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async getActiveScheduleFile(companyId: string): Promise<ScheduleFile | null> {
    return this.scheduleFileRepository.findOne({
      where: { companyId: companyId, isActive: true },
    });
  }

  async updateScheduleData(
    id: string,
    companyId: string,
    updateData: Partial<ScheduleData>,
  ): Promise<ScheduleData> {
    await this.findScheduleDataById(id, companyId);
    await this.scheduleDataRepository.update(id, updateData);
    return this.findScheduleDataById(id, companyId);
  }
  async getColumnMappings(companyId: string): Promise<CompanyColumnMapping[]> {
    return this.columnMappingRepository.find({
      where: { companyId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async createColumnMapping(
    companyId: string,
    dto: CreateColumnMappingDto,
  ): Promise<CompanyColumnMapping> {
    if (dto.isDefault) {
      await this.columnMappingRepository.update(
        { companyId, isDefault: true },
        { isDefault: false },
      );
    }

    const mapping = this.columnMappingRepository.create({
      companyId,
      ...dto,
      isActive: true,
    });

    return this.columnMappingRepository.save(mapping);
  }

  async updateColumnMapping(
    id: string,
    companyId: string,
    dto: UpdateColumnMappingDto,
  ): Promise<CompanyColumnMapping> {
    const mapping = await this.columnMappingRepository.findOne({
      where: { id, companyId },
    });

    if (!mapping) {
      throw new NotFoundException(`Column mapping not found`);
    }

    if (dto.isDefault && !mapping.isDefault) {
      await this.columnMappingRepository.update(
        { companyId, isDefault: true },
        { isDefault: false },
      );
    }

    Object.assign(mapping, dto);
    return this.columnMappingRepository.save(mapping);
  }

  // ===== NEW METHODS FOR FRONTEND =====

  async getDepartmentSummary(companyId: string): Promise<any[]> {
    const summary = await this.scheduleDataRepository
      .createQueryBuilder('sd')
      .select('sd.department', 'department_name')
      .addSelect('SUM(sd.qtyOpen)', 'target_qty') // Assuming target is open qty for now, adjust as needed
      .addSelect(
        "SUM(CAST(NULLIF(regexp_replace(sd.prodQty, '[^0-9]', '', 'g'), '') AS INTEGER))",
        'completed_qty',
      ) // Cast string prodQty to integer, handling non-numeric chars
      .addSelect('d.id', 'id')
      .addSelect('d.displayName', 'display_name')
      .addSelect('d.departmentCode', 'department_code')
      .leftJoin(
        Department,
        'd',
        'd.companyId = sd.companyId AND (d.departmentName = sd.department OR d.displayName = sd.department)',
      )
      .where('sd.companyId = :companyId', { companyId })
      .andWhere('sd.department IS NOT NULL')
      .groupBy('sd.department')
      .addGroupBy('d.id')
      .addGroupBy('d.displayName')
      .addGroupBy('d.departmentCode')
      .getRawMany();

    return summary.map((item) => {
      const target = parseFloat(item.target_qty) || 0;
      const completed = parseFloat(item.completed_qty) || 0;
      return {
        id: item.id || `dept_${item.department_name}`,
        departmentName: item.department_name,
        displayName: item.display_name || item.department_name,
        departmentCode:
          item.department_code ||
          item.department_name.substring(0, 3).toUpperCase(),
        targetQty: target,
        completedQty: completed,
        percentage: target > 0 ? (completed / target) * 100 : 0,
      };
    });
  }

  async getScheduleColumns(
    companyId: string,
  ): Promise<{ excelName: string; normalizedName: string }[]> {
    const mapping = await this.columnMappingRepository.findOne({
      where: { companyId, isDefault: true, isActive: true },
    });

    const normalizationRules = mapping?.normalizationRules || {};
    const excelColumns = Object.keys(normalizationRules);

    return excelColumns.map((excelName) => ({
      excelName,
      normalizedName: normalizationRules[excelName],
    }));
  }

  async getScheduleSyncConfig(companyId: string): Promise<any> {
    const config = await this.systemConfigRepository.findOne({
      where: { companyId, configKey: 'SCHEDULE_SYNC_STATE' },
    });

    const activeFile = await this.getActiveScheduleFile(companyId);

    if (!activeFile) {
      return {
        success: true,
        scheduleFile: null,
      };
    }

    return {
      success: true,
      scheduleFile: {
        ...activeFile,
        lastSyncStatus: config?.configValue || 'success',
        lastSyncError: null,
        syncRetryCount: 0,
        nextRetryAt: null,
        emailNotifications: true,
        automaticBackups: true,
      },
    };
  }

  async triggerScheduleSync(companyId: string): Promise<any> {
    // 1. Update system config to pending
    let config = await this.systemConfigRepository.findOne({
      where: { companyId, configKey: 'SCHEDULE_SYNC_STATE' },
    });

    if (!config) {
      config = this.systemConfigRepository.create({
        companyId,
        configKey: 'SCHEDULE_SYNC_STATE',
        configType: 'string',
        category: 'schedule',
        isActive: true,
      });
    }

    config.configValue = 'pending';
    await this.systemConfigRepository.save(config);

    // 2. In a real app, this would dispatch a Job/Queue
    // await this.queue.add('sync-schedule', { companyId });

    return {
      success: true,
      message: 'Sync started',
    };
  }

  /**
   * Get time segments by schedule data ID with expanded operator and equipment info
   */
  async getTimeSegmentsByScheduleId(
    scheduleId: string,
    companyId: string,
  ): Promise<any[]> {
    // First get the schedule data to get the work order ID
    const scheduleData = await this.findScheduleDataById(scheduleId, companyId);

    if (!scheduleData || !scheduleData.woId) {
      return [];
    }

    // Query time segments with operator and equipment information
    const timeSegments = await this.timeSegmentRepository
      .createQueryBuilder('ts')
      .leftJoinAndSelect('ts.operator', 'operator')
      .leftJoinAndSelect('ts.workOrder', 'workOrder')
      .leftJoin(Equipment, 'equipment', 'equipment.id = ts.equipmentId')
      .addSelect(['equipment.id', 'equipment.name'])
      .where('workOrder.woNumber = :woNumber', { woNumber: scheduleData.woId })
      .andWhere('ts.companyId = :companyId', { companyId })
      .andWhere('ts.isActive = :isActive', { isActive: true })
      .orderBy('ts.startTime', 'ASC')
      .getMany();

    // Transform to match the expected frontend structure
    return timeSegments.map((segment: any) => {
      // Calculate down time in minutes
      let downTimeMinutes = 0;
      if (segment.segmentType === 'downtime' && segment.durationMinutes) {
        downTimeMinutes = segment.durationMinutes;
      }

      return {
        id: parseInt(segment.id),
        workOrderId: segment.workOrderId,
        startTime: segment.startTime.toISOString(),
        endTime: segment.endTime ? segment.endTime.toISOString() : null,
        qtyCompleted: segment.qtyProduced || 0,
        downTimeMinutes,
        notes: segment.notes || null,
        step: null, // This field doesn't exist in TimeSegment entity yet
        operatorId: segment.operatorId || null,
        operatorName: segment.operator
          ? `${segment.operator.firstName || ''} ${segment.operator.lastName || ''}`.trim()
          : null,
        machineName: segment.equipment_name || null,
        equipmentId: segment.equipmentId || null,
      };
    });
  }
}
