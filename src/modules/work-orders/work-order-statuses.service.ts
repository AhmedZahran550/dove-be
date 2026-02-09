import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WorkOrderStatus } from '../../database/entities/work-order-status.entity';
import { DBService } from '@/database/db.service';
import { CreateWorkOrderStatusDto } from './dto/statuses/create-status.dto';
import { FilterOperator, FilterSuffix } from 'nestjs-paginate';
import { QueryConfig } from '@/common/query-options';
import { CacheService } from '@/common/cache.service';
import {
  DEFAULT_WORK_ORDER_STATUSES,
  getDefaultStatusId,
  StatusType,
} from './constants/default-statuses.constant';

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

  /**
   * Get all work order statuses for a company, including defaults
   * Custom statuses with the same code override defaults
   */
  async findAllWithDefaults(companyId: string): Promise<any[]> {
    // Get custom statuses for this company
    const customStatuses = await this.statusesRepository.find({
      where: { companyId, isActive: true },
      order: { displayOrder: 'ASC' },
    });

    // Create a map of custom status codes for quick lookup
    const customStatusCodes = new Set(customStatuses.map((s) => s.code));

    // Get defaults that aren't overridden by custom statuses
    const defaultsToInclude = DEFAULT_WORK_ORDER_STATUSES.filter(
      (defaultStatus) => !customStatusCodes.has(defaultStatus.code),
    ).map((defaultStatus) => ({
      ...defaultStatus,
      id: getDefaultStatusId(defaultStatus.code),
      companyId,
      statusType: StatusType.DEFAULT,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Add statusType to custom statuses
    const customStatusesWithType = customStatuses.map((status) => ({
      ...status,
      statusType: StatusType.CUSTOM,
    }));

    // Merge and sort by displayOrder
    const allStatuses = [...customStatusesWithType, ...defaultsToInclude].sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
    );

    return allStatuses;
  }
}
