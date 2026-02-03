import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { WorkOrderStatusesService } from './work-order-statuses.service';
import { UserProfile } from '../../database/entities';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { QueryOptions, Paginate } from '../../common/query-options';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';
import { plainToInstance } from 'class-transformer';
import { WorkOrderStatusResponseDto } from './dto/statuses/work-order-status-response.dto';

@ApiTags('work-order-statuses')
@Controller('work-order-statuses')
@ApiBearerAuth('JWT-auth')
@Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
export class WorkOrderStatusesController {
  constructor(private readonly statusesService: WorkOrderStatusesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all work order statuses' })
  @ApiResponse({ status: 200, description: 'Return all statuses' })
  async findAll(
    @Paginate() query: QueryOptions,
    @AuthUser() user: UserProfile,
  ) {
    const qb = this.statusesService.getQueryBuilder({ alias: 'status' });
    qb.where('status.companyId = :companyId', { companyId: user.companyId });

    const result = await this.statusesService.findAll(query, qb);
    return {
      ...result,
      data: plainToInstance(WorkOrderStatusResponseDto, result.data, {
        excludeExtraneousValues: true,
      }),
    };
  }
}
