import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../database/entities';
import { DBService } from '@/database/db.service';
import { Paginated, FilterOperator, FilterSuffix } from 'nestjs-paginate';
import { QueryConfig } from '@/common/query-options';

export const COMPANIES_PAGINATION_CONFIG: QueryConfig<Company> = {
  sortableColumns: ['createdAt', 'updatedAt', 'name'],
  defaultSortBy: [['createdAt', 'DESC']],
  searchableColumns: ['name', 'slug', 'contactEmail', 'contactPhone'],
  select: undefined,
  filterableColumns: {
    isActive: [FilterOperator.EQ],
  },
};

@Injectable()
export class CompaniesService extends DBService<Company> {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {
    super(companiesRepository, COMPANIES_PAGINATION_CONFIG);
  }

  async findBySlug(slug: string): Promise<Company | null> {
    return this.companiesRepository.findOne({
      where: { slug },
    });
  }
}
