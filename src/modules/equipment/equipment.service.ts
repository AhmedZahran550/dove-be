import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Equipment } from '../../database/entities';
import { DBService } from '@/database/db.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { FilterOperator, FilterSuffix } from 'nestjs-paginate';
import { QueryConfig } from '@/common/query-options';
import { CacheService } from '@/common/cache.service';

export const EQUIPMENT_PAGINATION_CONFIG: QueryConfig<Equipment> = {
  sortableColumns: ['createdAt', 'updatedAt', 'name', 'status'],
  defaultSortBy: [['createdAt', 'DESC']],
  searchableColumns: ['name', 'serial_number'],
  select: undefined, // Select all by default
  filterableColumns: {
    status: [FilterOperator.EQ, FilterSuffix.NOT],
    type: [FilterOperator.EQ],
    'company.id': [FilterOperator.EQ],
    'location.id': [FilterOperator.EQ],
  },
  relations: ['company', 'location'],
};

@Injectable()
export class EquipmentService extends DBService<
  Equipment,
  CreateEquipmentDto,
  UpdateEquipmentDto
> {
  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    private cacheService: CacheService,
    private dataSource: DataSource,
  ) {
    super(equipmentRepository, EQUIPMENT_PAGINATION_CONFIG);
  }
}
