import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../../database/entities';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationsRepository: Repository<Location>,
  ) {}

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

  async create(companyId: string, data: Partial<Location>): Promise<Location> {
    const location = this.locationsRepository.create({
      ...data,
      companyId: companyId,
    });
    return this.locationsRepository.save(location);
  }

  async update(id: string, data: Partial<Location>): Promise<Location> {
    await this.locationsRepository.update(id, data);
    return this.findById(id);
  }
}
