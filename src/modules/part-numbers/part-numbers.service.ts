import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PartNumber } from '../../database/entities';
import { DBService } from '@/database/db.service';
import { CreatePartNumberDto } from './dto/create-part-number.dto';
import { UpdatePartNumberDto } from './dto/update-part-number.dto';
import { FilterOperator, FilterSuffix } from 'nestjs-paginate';
import { QueryConfig } from '@/common/query-options';
import { CacheService } from '@/common/cache.service';

export const PART_NUMBERS_PAGINATION_CONFIG: QueryConfig<PartNumber> = {
  sortableColumns: [
    'createdAt',
    'updatedAt',
    'productId',
    'description',
    'standardCost',
    'sellingPrice',
  ],
  defaultSortBy: [['createdAt', 'DESC']],
  searchableColumns: [
    'productId',
    'description',
    'sku',
    'barcode',
    'productCategory',
  ],
  select: undefined,
  filterableColumns: {
    inventoryType: [FilterOperator.EQ],
    productCategory: [FilterOperator.EQ],
    lifecycleStatus: [FilterOperator.EQ],
    makeOrBuy: [FilterOperator.EQ],
    'company.id': [FilterOperator.EQ],
    'location.id': [FilterOperator.EQ],
    isActive: [FilterOperator.EQ],
  },
  relations: ['company', 'location'],
};

@Injectable()
export class PartNumbersService extends DBService<
  PartNumber,
  CreatePartNumberDto,
  UpdatePartNumberDto
> {
  constructor(
    @InjectRepository(PartNumber)
    private partNumberRepository: Repository<PartNumber>,
    private cacheService: CacheService,
    private dataSource: DataSource,
  ) {
    super(partNumberRepository, PART_NUMBERS_PAGINATION_CONFIG);
  }
}
