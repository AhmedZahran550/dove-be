import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../../database/entities';
import { DepartmentSetting } from '../../database/entities';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { DBService } from '@/database/db.service';
import { Paginated, FilterOperator, FilterSuffix } from 'nestjs-paginate';
import { QueryConfig, QueryOptions } from '@/common/query-options';

export const DEPARTMENTS_PAGINATION_CONFIG: QueryConfig<Department> = {
  sortableColumns: ['createdAt', 'updatedAt', 'department_name', 'sort_order'],
  defaultSortBy: [['sort_order', 'ASC']],
  searchableColumns: ['department_name', 'department_code', 'display_name'],
  select: undefined,
  filterableColumns: {
    is_active: [FilterOperator.EQ],
    company_id: [FilterOperator.EQ],
  },
  relations: ['department_settings'],
};

@Injectable()
export class DepartmentsService extends DBService<Department> {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
    @InjectRepository(DepartmentSetting)
    private settingsRepository: Repository<DepartmentSetting>,
  ) {
    super(departmentsRepository, DEPARTMENTS_PAGINATION_CONFIG);
  }

  async findByCompany(
    companyId: string,
    query: QueryOptions,
  ): Promise<Paginated<Department>> {
    const qb = this.departmentsRepository.createQueryBuilder('department');
    qb.where('department.company_id = :companyId', { companyId });
    qb.andWhere('department.is_active = :isActive', { isActive: true });

    return super.findAll(query, qb);
  }

  async findDepartmentById(id: string, companyId: string): Promise<Department> {
    const department = await this.departmentsRepository.findOne({
      where: { id, company_id: companyId },
      relations: ['department_settings'],
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
      company_id: companyId,
      department_name: dto.department_name,
      department_code: dto.department_code,
      display_name: dto.display_name || dto.department_name,
      description: dto.description,
      sort_order: dto.sort_order || 0,
      is_active: true,
    });

    const savedDepartment = await this.departmentsRepository.save(department);

    // Create filter settings
    const settingsToInsert: Partial<DepartmentSetting>[] = [];

    if (dto.includeFilters && dto.includeFilters.length > 0) {
      for (const filter of dto.includeFilters) {
        if (filter.table && filter.column && filter.value) {
          settingsToInsert.push({
            company_id: companyId,
            department_id: savedDepartment.id,
            department_name: dto.department_name,
            display_name: dto.display_name || dto.department_name,
            filter_table: filter.table,
            filter_column: filter.column,
            filter_value: filter.value,
            filter_operator: filter.operator || 'Equals',
            is_active: true,
          });
        }
      }
    }

    if (dto.excludeFilters && dto.excludeFilters.length > 0) {
      for (const filter of dto.excludeFilters) {
        if (filter.table && filter.column && filter.value) {
          settingsToInsert.push({
            company_id: companyId,
            department_id: savedDepartment.id,
            department_name: dto.department_name,
            display_name: dto.display_name || dto.department_name,
            filter_table: filter.table,
            filter_column: filter.column,
            filter_value: filter.value,
            filter_operator: filter.operator || '!=',
            is_active: true,
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

    await this.departmentsRepository.update(id, {
      ...dto,
      updatedAt: new Date(),
    });

    return this.findDepartmentById(id, companyId);
  }

  async deleteDepartment(id: string, companyId: string): Promise<void> {
    const department = await this.findDepartmentById(id, companyId);

    // Soft delete by setting is_active to false
    await this.departmentsRepository.update(id, {
      is_active: false,
      updatedAt: new Date(),
    });
  }

  async getFilterOptions(
    companyId: string,
  ): Promise<{ tables: string[]; columns: Record<string, string[]> }> {
    // Return available filter options
    return {
      tables: ['schedule_data', 'work_orders', 'products'],
      columns: {
        schedule_data: ['department', 'status', 'part_number', 'shift'],
        work_orders: ['current_status', 'department_id', 'equipment_id'],
        products: ['category', 'type'],
      },
    };
  }
}
