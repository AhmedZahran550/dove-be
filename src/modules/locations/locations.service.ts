import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paginated, FilterOperator, FilterSuffix } from 'nestjs-paginate';
import { Location } from '../../database/entities';
import { DBService } from '@/database/db.service';
import { QueryConfig, QueryOptions } from '@/common/query-options';
import { CreateLocationDto } from './dto/location.dto';
import { UpdateLocationDto } from './dto/location.dto';

export const LOCATIONS_PAGINATION_CONFIG: QueryConfig<Location> = {
  sortableColumns: ['createdAt', 'updatedAt', 'name', 'city'],
  defaultSortBy: [['createdAt', 'DESC']],
  searchableColumns: ['name', 'city', 'addressLine1', 'postalCode'],
  select: undefined,
  filterableColumns: {
    isActive: [FilterOperator.EQ],
    city: [FilterOperator.EQ],
    'company.id': [FilterOperator.EQ],
  },
};

@Injectable()
export class LocationsService extends DBService<
  Location,
  CreateLocationDto,
  UpdateLocationDto
> {
  constructor(
    @InjectRepository(Location)
    private locationsRepository: Repository<Location>,
  ) {
    super(locationsRepository, LOCATIONS_PAGINATION_CONFIG);
  }

  async findByCompany(
    companyId: string,
    query: QueryOptions,
  ): Promise<Paginated<Location>> {
    const qb = this.locationsRepository.createQueryBuilder('location');
    qb.where('location.companyId = :companyId', { companyId });
    qb.andWhere('location.isActive = :isActive', { isActive: true });
    qb.orderBy('location.name', 'ASC');

    return super.findAll(query, qb);
  }

  async findById(id: string): Promise<Location> {
    const location = await this.locationsRepository.findOne({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return location;
  }

  async update(id: string, data: Partial<Location>): Promise<Location> {
    await this.locationsRepository.update(id, data);
    return this.findById(id);
  }
}
