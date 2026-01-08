import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../../database/entities';
import { DepartmentSetting } from '../../database/entities';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
    @InjectRepository(DepartmentSetting)
    private settingsRepository: Repository<DepartmentSetting>,
  ) {}

  async findByCompany(companyId: string): Promise<Department[]> {
    return this.departmentsRepository.find({
      where: { company_id: companyId, is_active: true },
      relations: ['department_settings'],
      order: { sort_order: 'ASC' },
    });
  }

  async findById(id: string, companyId: string): Promise<Department> {
    const department = await this.departmentsRepository.findOne({
      where: { id, company_id: companyId },
      relations: ['department_settings'],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async create(
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

    return this.findById(savedDepartment.id, companyId);
  }

  async update(
    id: string,
    companyId: string,
    dto: UpdateDepartmentDto,
  ): Promise<Department> {
    const department = await this.findById(id, companyId);

    await this.departmentsRepository.update(id, {
      ...dto,
      updated_at: new Date(),
    });

    return this.findById(id, companyId);
  }

  async delete(id: string, companyId: string): Promise<void> {
    const department = await this.findById(id, companyId);

    // Soft delete by setting is_active to false
    await this.departmentsRepository.update(id, {
      is_active: false,
      updated_at: new Date(),
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

