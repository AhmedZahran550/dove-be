import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ScheduleService } from '../schedule/schedule.service';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserProfile } from '@/database/entities/user-profile.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';
import {
  SqliteConnectionResponseDto,
  UpdateSqliteConnectionDto,
} from '../schedule/dto/sync-agent.dto';
import { SqliteSwagger } from '@/swagger/sqlite.swagger';

@ApiTags('sqlite')
@Controller('sqlite/connections')
@ApiBearerAuth('JWT-auth')
@Roles(Role.ADMIN)
export class SqliteConnectionsController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @SqliteSwagger.getSqliteConnections()
  async getSqliteConnections(
    @AuthUser() user: UserProfile,
  ): Promise<SqliteConnectionResponseDto> {
    const connections = await this.scheduleService.getSqliteConnections(
      user.companyId,
    );
    return { success: true, connections };
  }

  @Put()
  @SqliteSwagger.updateSqliteConnection()
  async updateSqliteConnection(
    @AuthUser() user: UserProfile,
    @Body() dto: UpdateSqliteConnectionDto,
  ): Promise<any> {
    return this.scheduleService.updateSqliteConnection(user.companyId, dto);
  }
}
