import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConditionalStatusRule } from '../../database/entities/conditional-status-rule.entity';
import { DBService } from '@/database/db.service';
import { CreateConditionalStatusRuleDto } from './dto/conditional-rules/create-rule.dto';
import { FilterOperator, FilterSuffix } from 'nestjs-paginate';
import { QueryConfig } from '@/common/query-options';
import { CacheService } from '@/common/cache.service';

export const CONDITIONAL_RULES_PAGINATION_CONFIG: QueryConfig<ConditionalStatusRule> =
  {
    sortableColumns: ['createdAt', 'updatedAt', 'rule_name', 'priority'],
    defaultSortBy: [['priority', 'ASC']],
    searchableColumns: ['rule_name', 'description'],
    select: undefined,
    filterableColumns: {
      is_active: [FilterOperator.EQ],
      'company.id': [FilterOperator.EQ],
    },
    relations: [],
  };

@Injectable()
export class ConditionalStatusRulesService extends DBService<
  ConditionalStatusRule,
  CreateConditionalStatusRuleDto
> {
  constructor(
    @InjectRepository(ConditionalStatusRule)
    private rulesRepository: Repository<ConditionalStatusRule>,
    private cacheService: CacheService,
    private dataSource: DataSource,
  ) {
    super(rulesRepository, CONDITIONAL_RULES_PAGINATION_CONFIG);
  }
}
