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
import { InvitationsService } from '../invitations/invitations.service';
import { Role } from '../auth/role.model';

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
    private invitationsService: InvitationsService,
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
      postalCode: dto.postalCode,
      country: dto.country,
      phone: dto.phone,
      managerEmail: dto.adminEmail,
      shifts: dto.shifts,
      companyId: dto.company.id,
      isActive: true,
    });
    const savedLocation = await this.locationsRepository.save(entity);

    // If adminEmail is provided and we have user context, trigger invitation
    if (dto.adminEmail && options?.user) {
      try {
        await this.invitationsService.createInvitation(
          dto.company.id,
          options.user,
          {
            email: dto.adminEmail,
            role: Role.LOCATION_ADMIN,
            locationId: savedLocation.id,
          },
        );
      } catch (error) {
        this.logger.error(
          `Failed to create invitation for ${dto.adminEmail} for location ${savedLocation.id}`,
          error,
        );
        // We don't throw error to avoid rolling back location creation
        // Invitation failure shouldn't prevent location creation
      }
    }

    return savedLocation;
  }

  async update(
    id: string,
    dto: UpdateLocationDto,
    options?: TransactionOptions,
  ): Promise<Location> {
    const existingLocation = await this.findById(id);

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.code) updateData.code = dto.code;
    if (dto.description) updateData.description = dto.description;
    if (dto.address) updateData.addressLine1 = dto.address;
    if (dto.city) updateData.city = dto.city;
    if (dto.state) updateData.stateProvince = dto.state;
    if (dto.postalCode) updateData.postalCode = dto.postalCode;
    if (dto.country) updateData.country = dto.country;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.adminEmail) updateData.managerEmail = dto.adminEmail;
    if (dto.shifts) updateData.shifts = dto.shifts;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    await this.locationsRepository.update(id, updateData);

    // If adminEmail is updated and it's different from current managerEmail
    if (
      dto.adminEmail &&
      dto.adminEmail !== existingLocation.managerEmail &&
      options?.user
    ) {
      try {
        await this.invitationsService.createInvitation(
          existingLocation.companyId,
          options.user,
          {
            email: dto.adminEmail,
            role: Role.LOCATION_ADMIN,
            locationId: id,
          },
        );
      } catch (error) {
        this.logger.error(
          `Failed to create invitation for ${dto.adminEmail} during update for location ${id}`,
          error,
        );
      }
    }

    return this.findById(id);
  }
}
