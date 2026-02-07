import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WorkOrderStatusesService } from './work-order-statuses.service';
import { UserProfile } from '../../database/entities';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';
import { plainToInstance } from 'class-transformer';
import { WorkOrderStatusResponseDto } from './dto/statuses/work-order-status-response.dto';
import { WorkOrderStatusesSwagger } from '@/swagger';

@ApiTags('work-order-statuses')
@Controller('work-order-statuses')
@ApiBearerAuth('JWT-auth')
@Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN, Role.OPERATOR, Role.USER)
export class WorkOrderStatusesController {
  constructor(private readonly statusesService: WorkOrderStatusesService) {}

  @Get()
  @WorkOrderStatusesSwagger.findAll()
  async findAll(@AuthUser() user: UserProfile) {
    const statuses = await this.statusesService.findAllWithDefaults(
      user.companyId,
    );

    return plainToInstance(WorkOrderStatusResponseDto, statuses, {
      excludeExtraneousValues: true,
    });
  }
}
