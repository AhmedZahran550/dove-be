import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WorkOrderStatus } from '../../database/entities/work-order-status.entity';
import { DBService } from '@/database/db.service';
import { CreateWorkOrderStatusDto } from './dto/statuses/create-status.dto';
import { FilterOperator, FilterSuffix } from 'nestjs-paginate';
import { QueryConfig } from '@/common/query-options';
import { CacheService } from '@/common/cache.service';

export const WORK_ORDER_STATUSES_PAGINATION_CONFIG: QueryConfig<WorkOrderStatus> =
  {
    sortableColumns: ['createdAt', 'updatedAt', 'name', 'displayOrder'],
    defaultSortBy: [['displayOrder', 'ASC']],
    searchableColumns: ['name', 'code', 'description'],
    select: undefined,
    filterableColumns: {
      isActive: [FilterOperator.EQ],
      'company.id': [FilterOperator.EQ],
    },
    relations: [],
  };

@Injectable()
export class WorkOrderStatusesService extends DBService<
  WorkOrderStatus,
  CreateWorkOrderStatusDto
> {
  constructor(
    @InjectRepository(WorkOrderStatus)
    private statusesRepository: Repository<WorkOrderStatus>,
    private cacheService: CacheService,
    private dataSource: DataSource,
  ) {
    super(statusesRepository, WORK_ORDER_STATUSES_PAGINATION_CONFIG);
  }
}
