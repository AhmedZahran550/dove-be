import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ProcessStepsService } from './process-steps.service';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserProfile } from '../../database/entities';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';
import { Cacheable } from '@/common/decorators/cache.decorator';

@ApiTags('process-steps')
@Controller('process-steps')
@ApiBearerAuth('JWT-auth')
@Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN, Role.OPERATOR, Role.USER)
export class ProcessStepsController {
  constructor(private readonly processStepsService: ProcessStepsService) {}

  @Get()
  @ApiOperation({ summary: 'Get process steps for a department' })
  @ApiResponse({
    status: 200,
    description: 'Return all process steps for the department.',
  })
  @Cacheable({ key: 'process-steps:dept:{{department_id}}', ttl: 300 })
  async findAll(
    @AuthUser() user: UserProfile,
    @Query('department_id') departmentId: string,
  ) {
    if (!departmentId) {
      return { success: true, data: [] };
    }
    const steps = await this.processStepsService.findByDepartment(
      user.companyId,
      departmentId,
    );
    return { success: true, data: steps };
  }
}
