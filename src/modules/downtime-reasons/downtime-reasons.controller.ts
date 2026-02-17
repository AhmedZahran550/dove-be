import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DowntimeReasonsService } from './downtime-reasons.service';
import { CreateDowntimeReasonDto } from './dto/create-downtime-reason.dto';
import { UpdateDowntimeReasonDto } from './dto/update-downtime-reason.dto';
import { AuthUser } from '../../modules/auth/decorators/auth-user.decorator';
import { UserProfile } from '../../database/entities';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { Role } from '../../modules/auth/role.model';
import { DowntimeReasonsSwagger } from '@/swagger';
import { Paginate, QueryOptions } from '@/common/query-options';
@ApiTags('downtime-reasons')
@Controller('downtime-reasons')
@ApiBearerAuth('JWT-auth')
@Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
export class DowntimeReasonsController {
  constructor(
    private readonly downtimeReasonsService: DowntimeReasonsService,
  ) {}

  @Post()
  @DowntimeReasonsSwagger.create()
  create(@Body() dto: CreateDowntimeReasonDto, @AuthUser() user: UserProfile) {
    return this.downtimeReasonsService.create({
      ...dto,
      companyId: user.companyId,
    } as any);
  }

  @Get()
  @DowntimeReasonsSwagger.findAll()
  @ApiQuery({ name: 'department_id', required: false, type: String })
  @ApiQuery({ name: 'include_company_level', required: false, type: Boolean })
  findAll(
    @AuthUser() user: UserProfile,
    @Paginate() query: QueryOptions,
    @Query('department_id') departmentId?: string,
    @Query('include_company_level') includeCompanyLevel?: boolean,
  ) {
    const includeGlobal = includeCompanyLevel === true;
    return this.downtimeReasonsService.findAllByCompany(
      query,
      user.companyId,
      departmentId,
      includeGlobal,
    );
  }

  @Get(':id')
  @DowntimeReasonsSwagger.findOne()
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ) {
    return this.downtimeReasonsService.findOneOrFail({
      where: { id, companyId: user.companyId },
      relations: { category: true },
    });
  }

  @Patch(':id')
  @DowntimeReasonsSwagger.update()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
    @Body() dto: UpdateDowntimeReasonDto,
  ) {
    return this.downtimeReasonsService.update(id, dto);
  }

  @Delete(':id')
  @DowntimeReasonsSwagger.remove()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.downtimeReasonsService.remove(id);
  }
}
