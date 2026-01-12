import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../../database/entities';
import { DBService } from '@/database/db.service';
import { CreateLocationDto } from './dto/location.dto';
import { UpdateLocationDto } from './dto/location.dto';

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
    super(locationsRepository);
  }

  async findByCompany(companyId: string): Promise<Location[]> {
    return this.locationsRepository.find({
      where: { companyId: companyId, isActive: true },
      order: { name: 'ASC' },
    });
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
