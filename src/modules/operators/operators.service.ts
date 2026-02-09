import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Operator } from '../../database/entities';
import { DBService } from '@/database/db.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { FilterOperator, FilterSuffix } from 'nestjs-paginate';
import { QueryConfig, TransactionOptions } from '@/common/query-options';
import { CacheService } from '@/common/cache.service';

export const OPERATORS_PAGINATION_CONFIG: QueryConfig<Operator> = {
  sortableColumns: [
    'createdAt',
    'updatedAt',
    'firstName',
    'lastName',
    'status',
  ],
  defaultSortBy: [['createdAt', 'DESC']],
  searchableColumns: ['firstName', 'lastName', 'operatorId', 'email'],
  select: undefined,
  filterableColumns: {
    status: [FilterOperator.EQ, FilterSuffix.NOT],
    position: [FilterOperator.EQ],
    employeeType: [FilterOperator.EQ],
    shift: [FilterOperator.EQ],
    'defaultLocation.id': [FilterOperator.EQ],
    'company.id': [FilterOperator.EQ],
  },
};

@Injectable()
export class OperatorsService extends DBService<
  Operator,
  CreateOperatorDto,
  UpdateOperatorDto
> {
  constructor(
    @InjectRepository(Operator)
    private operatorsRepository: Repository<Operator>,
    private cacheService: CacheService,
    private dataSource: DataSource,
  ) {
    super(operatorsRepository, OPERATORS_PAGINATION_CONFIG);
  }

  async findAllActive(companyId: string) {
    return this.operatorsRepository.find({
      where: { companyId: companyId, status: 'active' },
    });
  }

  async create(
    dto: CreateOperatorDto,
    options?: TransactionOptions,
  ): Promise<Operator> {
    const entity = this.operatorsRepository.create({
      companyId: dto.company_id,
      operatorId: dto.operator_id,
      firstName: dto.first_name,
      lastName: dto.last_name,
      email: dto.email,
      phone: dto.phone,
      position: dto.position,
      employeeType: dto.employee_type,
      shift: dto.shift,
      dateOfBirth: dto.date_of_birth,
      hireDate: dto.hire_date,
      companyEmployeeId: dto.company_employee_id,
      status: dto.status,
      defaultLocationId: dto.default_location_id,
    });
    const saved = await this.operatorsRepository.save(entity);
    return saved;
  }

  async update(id: string, dto: UpdateOperatorDto): Promise<Operator> {
    const updateData: any = {};
    if (dto.operator_id) updateData.operatorId = dto.operator_id;
    if (dto.first_name) updateData.firstName = dto.first_name;
    if (dto.last_name) updateData.lastName = dto.last_name;
    if (dto.email) updateData.email = dto.email;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.position) updateData.position = dto.position;
    if (dto.employee_type) updateData.employeeType = dto.employee_type;
    if (dto.shift) updateData.shift = dto.shift;
    if (dto.date_of_birth) updateData.dateOfBirth = dto.date_of_birth;
    if (dto.hire_date) updateData.hireDate = dto.hire_date;
    if (dto.company_employee_id)
      updateData.companyEmployeeId = dto.company_employee_id;
    if (dto.status) updateData.status = dto.status;
    if (dto.default_location_id)
      updateData.defaultLocationId = dto.default_location_id;

    await this.operatorsRepository.update(id, updateData);
    return this.findById(id);
  }
}
