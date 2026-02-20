import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Department, DepartmentOeeSetting } from '../../database/entities';
import { DepartmentSetting } from '../../database/entities';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import {
  CreateOeeSettingDto,
  UpdateOeeSettingDto,
} from './dto/oee-setting.dto';
import { DBService } from '@/database/db.service';
import { Paginated, FilterOperator, FilterSuffix } from 'nestjs-paginate';
import { QueryConfig, QueryOptions } from '@/common/query-options';

export const DEPARTMENTS_PAGINATION_CONFIG: QueryConfig<Department> = {
  sortableColumns: ['createdAt', 'updatedAt', 'departmentName', 'sortOrder'],
  defaultSortBy: [['sortOrder', 'ASC']],
  searchableColumns: ['departmentName', 'departmentCode', 'displayName'],
  select: undefined,
  filterableColumns: {
    isActive: [FilterOperator.EQ],
    companyId: [FilterOperator.EQ],
  },
  relations: ['departmentSettings'],
};

// Whitelist to prevent SQL injection
const ALLOWED_TABLES: Record<string, string[]> = {
  work_order: [
    'current_status',
    'department_id',
    'equipment_id',
    'location_id',
    'wo_number',
  ],
  schedule_data: ['department', 'status', 'part_number', 'shift'],
  products: ['name', 'category', 'type'],
  partnumber_info: [
    'department',
    'product_category',
    'lifecycle_status',
    'inventory_type',
  ],
};

@Injectable()
export class DepartmentsService extends DBService<Department> {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
    @InjectRepository(DepartmentSetting)
    private settingsRepository: Repository<DepartmentSetting>,
    @InjectRepository(DepartmentOeeSetting)
    private oeeSettingsRepository: Repository<DepartmentOeeSetting>,
    private dataSource: DataSource,
  ) {
    super(departmentsRepository, DEPARTMENTS_PAGINATION_CONFIG);
  }

  async findByCompany(
    companyId: string,
    query: QueryOptions,
  ): Promise<Paginated<Department>> {
    const qb = this.departmentsRepository.createQueryBuilder('department');
    qb.where('department.companyId = :companyId', { companyId });
    qb.andWhere('department.isActive = :isActive', { isActive: true });

    return super.findAll(query, qb);
  }

  async findDepartmentById(id: string, companyId: string): Promise<Department> {
    const department = await this.departmentsRepository.findOne({
      where: { id, companyId: companyId },
      relations: ['departmentSettings'],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async createDepartment(
    companyId: string,
    dto: CreateDepartmentDto,
  ): Promise<Department> {
    const department = this.departmentsRepository.create({
      companyId: companyId,
      departmentName: dto.departmentName,
      departmentCode: dto.departmentCode,
      displayName: dto.displayName || dto.departmentName,
      description: dto.description,
      sortOrder: dto.sortOrder || 0,
      isActive: true,
    });

    const savedDepartment = await this.departmentsRepository.save(department);

    // Create filter settings
    const settingsToInsert: Partial<DepartmentSetting>[] = [];

    if (dto.includeFilters && dto.includeFilters.length > 0) {
      for (const filter of dto.includeFilters) {
        if (filter.table && filter.column && filter.value) {
          settingsToInsert.push({
            companyId: companyId,
            departmentId: savedDepartment.id,
            departmentName: dto.departmentName,
            displayName: dto.displayName || dto.departmentName,
            filterTable: filter.table,
            filterColumn: filter.column,
            filterValue: filter.value,
            filterOperator: filter.operator || 'Equals',
            isActive: true,
          });
        }
      }
    }

    if (dto.excludeFilters && dto.excludeFilters.length > 0) {
      for (const filter of dto.excludeFilters) {
        if (filter.table && filter.column && filter.value) {
          settingsToInsert.push({
            companyId: companyId,
            departmentId: savedDepartment.id,
            departmentName: dto.departmentName,
            displayName: dto.displayName || dto.departmentName,
            filterTable: filter.table,
            filterColumn: filter.column,
            filterValue: filter.value,
            filterOperator: filter.operator || '!=',
            isActive: true,
          });
        }
      }
    }

    if (settingsToInsert.length > 0) {
      await this.settingsRepository.save(settingsToInsert);
    }

    return this.findDepartmentById(savedDepartment.id, companyId);
  }

  async updateDepartment(
    id: string,
    companyId: string,
    dto: UpdateDepartmentDto,
  ): Promise<Department> {
    const department = await this.findDepartmentById(id, companyId);

    // Map DTO to entity properties
    const updateData: Partial<Department> = {};
    if (dto.departmentName) updateData.departmentName = dto.departmentName;
    if (dto.departmentCode) updateData.departmentCode = dto.departmentCode;
    if (dto.displayName) updateData.displayName = dto.displayName;
    if (dto.description) updateData.description = dto.description;
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    await this.departmentsRepository.update(id, {
      ...updateData,
      updatedAt: new Date(),
    });

    return this.findDepartmentById(id, companyId);
  }

  async deleteDepartment(id: string, companyId: string): Promise<void> {
    const department = await this.findDepartmentById(id, companyId);

    // Soft delete by setting isActive to false
    await this.departmentsRepository.update(id, {
      isActive: false,
      updatedAt: new Date(),
    });
  }

  async getFilterOptions(
    companyId: string,
  ): Promise<{ tables: string[]; columns: Record<string, string[]> }> {
    return {
      tables: Object.keys(ALLOWED_TABLES),
      columns: ALLOWED_TABLES,
    };
  }

  async getUniqueValues(table: string, column: string): Promise<string[]> {
    const allowedColumns = ALLOWED_TABLES[table];
    if (!allowedColumns) {
      throw new BadRequestException(`Table "${table}" is not allowed`);
    }
    if (!allowedColumns.includes(column)) {
      throw new BadRequestException(
        `Column "${column}" is not allowed for table "${table}"`,
      );
    }

    // Safe to interpolate — validated against whitelist above
    const rows: { value: string }[] = await this.dataSource.query(
      `SELECT DISTINCT "${column}" AS value FROM "${table}" WHERE "${column}" IS NOT NULL ORDER BY value ASC`,
    );

    return rows.map((r) => r.value).filter(Boolean);
  }

  // --- OEE Settings Methods ---

  async getCurrentOeeSetting(
    departmentId: string,
    companyId: string,
  ): Promise<DepartmentOeeSetting | null> {
    return this.oeeSettingsRepository.findOne({
      where: {
        departmentId,
        companyId,
        isArchived: false,
        effectiveTo: null,
      },
      order: { effectiveFrom: 'DESC' },
    });
  }

  async getOeeSettingsHistory(
    departmentId: string,
    companyId: string,
  ): Promise<DepartmentOeeSetting[]> {
    return this.oeeSettingsRepository.find({
      where: { departmentId, companyId },
      order: { effectiveFrom: 'DESC' },
    });
  }

  async createOeeSetting(
    departmentId: string,
    companyId: string,
    dto: CreateOeeSettingDto,
    userId: string,
  ): Promise<DepartmentOeeSetting> {
    // 1. Find the current active setting and close it (set effectiveTo)
    const currentActive = await this.getCurrentOeeSetting(
      departmentId,
      companyId,
    );
    if (currentActive) {
      currentActive.effectiveTo = new Date(dto.effectiveFrom);
      await this.oeeSettingsRepository.save(currentActive);
    }

    // 2. Calculate OEE Goal
    const oeeGoal = Number(
      (
        (dto.availabilityGoal * dto.performanceGoal * dto.qualityGoal) /
        10000
      ).toFixed(2),
    );

    // 3. Create new setting
    const newSetting = this.oeeSettingsRepository.create({
      departmentId,
      companyId,
      qcRequired: dto.qcRequired ?? true,
      availabilityGoal: dto.availabilityGoal,
      performanceGoal: dto.performanceGoal,
      qualityGoal: dto.qualityGoal,
      oeeGoal,
      effectiveFrom: new Date(dto.effectiveFrom),
      notes: dto.notes,
      createdBy: userId,
    });

    return this.oeeSettingsRepository.save(newSetting);
  }

  async archiveOeeSetting(
    settingId: string,
    companyId: string,
  ): Promise<DepartmentOeeSetting> {
    const setting = await this.oeeSettingsRepository.findOne({
      where: { id: settingId, companyId },
    });

    if (!setting) {
      throw new NotFoundException(`OEE setting with ID ${settingId} not found`);
    }

    setting.isArchived = true;
    return this.oeeSettingsRepository.save(setting);
  }
}
