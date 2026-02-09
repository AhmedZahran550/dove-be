import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paginated, FilterOperator, FilterSuffix } from 'nestjs-paginate';
import { Location } from '../../database/entities';
import { DBService } from '@/database/db.service';
import {
  QueryConfig,
  QueryOptions,
  TransactionOptions,
} from '@/common/query-options';
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

  async create(
    dto: CreateLocationDto,
    options?: TransactionOptions,
  ): Promise<Location> {
    const entity = this.locationsRepository.create({
      name: dto.name,
      code: dto.code,
      description: dto.description,
      addressLine1: dto.address, // Mapping DTO 'address' to 'addressLine1'
      city: dto.city,
      stateProvince: dto.state, // Mapping DTO 'state' to 'stateProvince'
      postalCode: dto.postal_code,
      country: dto.country,
      phone: dto.phone,
      email: dto.email,
      companyId: dto.company.id,
      isActive: true,
    });
    return this.locationsRepository.save(entity);
  }

  async update(id: string, dto: UpdateLocationDto): Promise<Location> {
    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.code) updateData.code = dto.code;
    if (dto.description) updateData.description = dto.description;
    if (dto.address) updateData.addressLine1 = dto.address;
    if (dto.city) updateData.city = dto.city;
    if (dto.state) updateData.stateProvince = dto.state;
    if (dto.postal_code) updateData.postalCode = dto.postal_code;
    if (dto.country) updateData.country = dto.country;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.email) updateData.email = dto.email;
    if (dto.is_active !== undefined) updateData.isActive = dto.is_active;

    await this.locationsRepository.update(id, updateData);
    return this.findById(id);
  }
}
