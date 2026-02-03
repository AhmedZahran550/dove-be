import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ConditionalStatusRulesService } from './conditional-status-rules.service';
import { UserProfile } from '../../database/entities';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { QueryOptions, Paginate } from '../../common/query-options';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';
import { plainToInstance } from 'class-transformer';
import { ConditionalStatusRuleResponseDto } from './dto/conditional-rules/conditional-rule-response.dto';

@ApiTags('conditional-status-rules')
@Controller('conditional-status-rules')
@ApiBearerAuth('JWT-auth')
@Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
export class ConditionalStatusRulesController {
  constructor(private readonly rulesService: ConditionalStatusRulesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all conditional status rules' })
  @ApiResponse({ status: 200, description: 'Return all rules' })
  async findAll(
    @Paginate() query: QueryOptions,
    @AuthUser() user: UserProfile,
  ) {
    const qb = this.rulesService.getQueryBuilder({ alias: 'rule' });
    qb.where('rule.company_id = :companyId', { companyId: user.companyId });

    const result = await this.rulesService.findAll(query, qb);
    return {
      ...result,
      data: plainToInstance(ConditionalStatusRuleResponseDto, result.data, {
        excludeExtraneousValues: true,
      }),
    };
  }
}
