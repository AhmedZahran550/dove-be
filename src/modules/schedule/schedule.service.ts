import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as XLSX from 'xlsx';
import { ScheduleData } from '../../database/entities';
import { ScheduleFile } from '../../database/entities';
import { CompanyColumnMapping } from '../../database/entities';
import { QueryOptions } from '../../common/query-options';
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
    fileData?: string,
    scheduleFileId?: string,
  ): Promise<ImportResultDto> {
    // 1. Read and parse file
    let workbook: XLSX.WorkBook;

    if (file) {
      workbook = XLSX.read(file.buffer, { type: 'buffer' });
    } else if (fileData) {
      // Handle base64 data URL
      const base64Data = fileData.includes(',')
        ? fileData.split(',')[1]
        : fileData;
      const buffer = Buffer.from(base64Data, 'base64');
      workbook = XLSX.read(buffer, { type: 'buffer' });
    } else {
      throw new BadRequestException('No file or file data provided');
    }

    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: false }) as Record<
      string,
      any
    >[];

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

    // 6. Upsert records (update if exists, insert if new)
    let insertedCount = 0;
    let updatedCount = 0;

    for (const record of recordsToUpsert) {
      const existing = await this.scheduleDataRepository.findOne({
        where: { companyId, woId: record.woId },
      });

      if (existing) {
        // Update existing record
        await this.scheduleDataRepository.update(existing.id, {
          ...record,
          id: existing.id,
        });
        updatedCount++;
      } else {
        // Insert new record
        await this.scheduleDataRepository.save(record);
        insertedCount++;
      }
    }

    // 7. Update mapping statistics
    await this.columnMappingRepository.update(mapping!.id, {
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
}
