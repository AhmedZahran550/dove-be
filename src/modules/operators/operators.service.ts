import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Operator } from '../../database/entities';
import { DBService } from '@/database/db.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { FilterOperator, FilterSuffix } from 'nestjs-paginate';
import { QueryConfig } from '@/common/query-options';
import { CacheService } from '@/common/cache.service';

export const OPERATORS_PAGINATION_CONFIG: QueryConfig<Operator> = {
  sortableColumns: [
    'createdAt',
    'updatedAt',
    'first_name',
    'last_name',
    'status',
  ],
  defaultSortBy: [['createdAt', 'DESC']],
  searchableColumns: ['first_name', 'last_name', 'operator_id', 'email'],
  select: undefined,
  filterableColumns: {
    status: [FilterOperator.EQ, FilterSuffix.NOT],
    position: [FilterOperator.EQ],
    employee_type: [FilterOperator.EQ],
    shift: [FilterOperator.EQ],
    'defaultLocation.id': [FilterOperator.EQ],
    'company.id': [FilterOperator.EQ],
  },
  relations: ['company', 'defaultLocation'],
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
      where: { company_id: companyId, status: 'active' },
    });
  }
}
