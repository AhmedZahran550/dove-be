import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConditionalStatusRule } from '../../database/entities/conditional-status-rule.entity';
import { DBService } from '@/database/db.service';
import { CreateConditionalStatusRuleDto } from './dto/conditional-rules/create-rule.dto';
import { FilterOperator, FilterSuffix } from 'nestjs-paginate';
import { QueryConfig, TransactionOptions } from '@/common/query-options';
import { CacheService } from '@/common/cache.service';

export const CONDITIONAL_RULES_PAGINATION_CONFIG: QueryConfig<ConditionalStatusRule> =
  {
    sortableColumns: ['createdAt', 'updatedAt', 'ruleName', 'priority'],
    defaultSortBy: [['priority', 'ASC']],
    searchableColumns: ['ruleName', 'description'],
    select: undefined,
    filterableColumns: {
      isActive: [FilterOperator.EQ],
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

  async create(
    dto: CreateConditionalStatusRuleDto,
    options?: TransactionOptions,
  ): Promise<ConditionalStatusRule> {
    const entity = this.rulesRepository.create({
      ruleName: dto.ruleName,
      description: dto.description,
      isActive: dto.isActive,
      priority: dto.priority,
      statusName: dto.statusName,
      conditions: dto.conditions,
      companyId: dto.companyId,
    });
    return this.rulesRepository.save(entity);
  }

  async update(
    id: string,
    dto: Partial<CreateConditionalStatusRuleDto>,
  ): Promise<ConditionalStatusRule> {
    const updateData: any = {};
    if (dto.ruleName) updateData.ruleName = dto.ruleName;
    if (dto.description) updateData.description = dto.description;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.priority !== undefined) updateData.priority = dto.priority;
    if (dto.statusName) updateData.statusName = dto.statusName;
    if (dto.conditions) updateData.conditions = dto.conditions;
    if (dto.companyId) updateData.companyId = dto.companyId;

    await this.rulesRepository.update(id, updateData);
    return this.findById(id);
  }
}
