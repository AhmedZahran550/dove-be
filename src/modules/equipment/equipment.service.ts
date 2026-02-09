import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Equipment } from '../../database/entities';
import { DBService } from '@/database/db.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { FilterOperator, FilterSuffix } from 'nestjs-paginate';
import { QueryConfig, TransactionOptions } from '@/common/query-options';
import { CacheService } from '@/common/cache.service';

export const EQUIPMENT_PAGINATION_CONFIG: QueryConfig<Equipment> = {
  sortableColumns: ['createdAt', 'updatedAt', 'name', 'status'],
  defaultSortBy: [['createdAt', 'DESC']],
  searchableColumns: ['name', 'serialNumber'],
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
  async findAllActive(companyId: string) {
    return this.equipmentRepository.find({
      where: { companyId: companyId, status: 'active' },
    });
  }

  async create(
    dto: CreateEquipmentDto,
    options?: TransactionOptions,
  ): Promise<Equipment> {
    const entity = this.equipmentRepository.create({
      name: dto.name,
      type: dto.type,
      status: dto.status,
      companyId: dto.companyId,
      locationId: dto.location_id,
      serialNumber: dto.serial_number,
    });
    return this.equipmentRepository.save(entity);
  }

  async update(id: string, dto: UpdateEquipmentDto): Promise<Equipment> {
    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.type) updateData.type = dto.type;
    if (dto.status) updateData.status = dto.status;
    if (dto.location_id) updateData.locationId = dto.location_id;
    if (dto.serial_number) updateData.serialNumber = dto.serial_number;

    await this.equipmentRepository.update(id, updateData);
    return this.findById(id);
  }
}
