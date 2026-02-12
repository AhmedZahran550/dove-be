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
      companyId: dto.companyId,
      operatorId: dto.operatorId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      position: dto.position,
      employeeType: dto.employeeType,
      shift: dto.shift,
      dateOfBirth: dto.dateOfBirth,
      hireDate: dto.hireDate,
      companyEmployeeId: dto.companyEmployeeId,
      status: dto.status,
      defaultLocationId: dto.defaultLocationId,
    });
    const saved = await this.operatorsRepository.save(entity);
    return saved;
  }

  async update(id: string, dto: UpdateOperatorDto): Promise<Operator> {
    const updateData: any = {};
    if (dto.operatorId) updateData.operatorId = dto.operatorId;
    if (dto.firstName) updateData.firstName = dto.firstName;
    if (dto.lastName) updateData.lastName = dto.lastName;
    if (dto.email) updateData.email = dto.email;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.position) updateData.position = dto.position;
    if (dto.employeeType) updateData.employeeType = dto.employeeType;
    if (dto.shift) updateData.shift = dto.shift;
    if (dto.dateOfBirth) updateData.dateOfBirth = dto.dateOfBirth;
    if (dto.hireDate) updateData.hireDate = dto.hireDate;
    if (dto.companyEmployeeId)
      updateData.companyEmployeeId = dto.companyEmployeeId;
    if (dto.status) updateData.status = dto.status;
    if (dto.defaultLocationId)
      updateData.defaultLocationId = dto.defaultLocationId;

    await this.operatorsRepository.update(id, updateData);
    return this.findById(id);
  }
}
