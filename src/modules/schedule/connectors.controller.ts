import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ScheduleService } from '../schedule/schedule.service';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserProfile } from '@/database/entities/user-profile.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';
import { ConnectorResponseDto } from '../schedule/dto/sync-agent.dto';
import { ConnectorsSwagger } from '@/swagger/connectors.swagger';

@ApiTags('connectors')
@Controller('connectors')
@ApiBearerAuth('JWT-auth')
@Roles(Role.ADMIN)
export class ConnectorsController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @ConnectorsSwagger.getAvailableConnectors()
  async getAvailableConnectors(
    @AuthUser() user: UserProfile,
  ): Promise<ConnectorResponseDto> {
    const connectors = await this.scheduleService.getAvailableConnectors(
      user.companyId,
    );
    return { success: true, connectors };
  }
}
