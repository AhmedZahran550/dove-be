import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../database/entities';
import { DBService } from '@/database/db.service';

@Injectable()
export class CompaniesService extends DBService<Company> {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {
    super(companiesRepository);
  }

  async findBySlug(slug: string): Promise<Company | null> {
    return this.companiesRepository.findOne({
      where: { slug },
    });
  }
}
