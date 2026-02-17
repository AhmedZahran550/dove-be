import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DowntimeCategoriesService } from './downtime-categories.service';
import { CreateDowntimeCategoryDto } from './dto/create-downtime-category.dto';
import { UpdateDowntimeCategoryDto } from './dto/update-downtime-category.dto';
import { AuthUser } from '../../modules/auth/decorators/auth-user.decorator';
import { UserProfile } from '../../database/entities';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { Role } from '../../modules/auth/role.model';
import { DowntimeCategoriesSwagger } from '@/swagger';
import { Paginate } from 'nestjs-paginate';
import { QueryOptions } from '@/common/query-options';
@ApiTags('downtime-categories')
@Controller('downtime-categories')
@ApiBearerAuth('JWT-auth')
@Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
export class DowntimeCategoriesController {
  constructor(
    private readonly downtimeCategoriesService: DowntimeCategoriesService,
  ) {}

  @Post()
  @DowntimeCategoriesSwagger.create()
  create(
    @Body() dto: CreateDowntimeCategoryDto,
    @AuthUser() user: UserProfile,
  ) {
    return this.downtimeCategoriesService.create({
      ...dto,
      companyId: user.companyId,
    });
  }

  @Get()
  @DowntimeCategoriesSwagger.findAll()
  findAll(@AuthUser() user: UserProfile, @Paginate() query: QueryOptions) {
    return this.downtimeCategoriesService.findAll(query);
  }

  @Get(':id')
  @DowntimeCategoriesSwagger.findOne()
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ) {
    return this.downtimeCategoriesService.findOneOrFail({
      where: { id, companyId: user.companyId },
      relations: ['department'],
    });
  }

  @Patch(':id')
  @DowntimeCategoriesSwagger.update()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
    @Body() dto: UpdateDowntimeCategoryDto,
  ) {
    return this.downtimeCategoriesService.update(id, dto, {
      where: { companyId: user.companyId },
    });
  }

  @Delete(':id')
  @DowntimeCategoriesSwagger.remove()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ) {
    return this.downtimeCategoriesService.softDelete(id, {
      where: { companyId: user.companyId },
    });
  }
}
