import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../database/entities';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async findById(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async findBySlug(slug: string): Promise<Company | null> {
    return this.companiesRepository.findOne({
      where: { slug },
    });
  }

  async update(id: string, updateData: Partial<Company>): Promise<Company> {
    await this.companiesRepository.update(id, updateData);
    return this.findById(id);
  }
}

