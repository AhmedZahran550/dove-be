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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OperatorsService } from './operators.service';
import { Operator } from '../../database/entities';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';
import { OperatorsSwagger } from '@/swagger/operators.swagger';
import { Paginate, QueryOptions } from '@/common/query-options';

import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserProfile } from '../../database/entities';
import { Cacheable, CacheEvict } from '@/common/decorators/cache.decorator';

@ApiTags('Operators')
@Controller('operators')
@Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService) {}

  @Get()
  @Cacheable({ key: 'operators:all', ttl: 60 })
  @OperatorsSwagger.findAll()
  findAll(@Paginate() query: QueryOptions) {
    return this.operatorsService.findAll(query);
  }

  @Get(':id')
  @Cacheable({ key: 'operators:{{id}}', ttl: 2592000 })
  @OperatorsSwagger.findOne()
  findOne(@Param('id') id: string) {
    return this.operatorsService.findById(id);
  }

  @Post()
  @CacheEvict('operators:all')
  @OperatorsSwagger.create()
  create(@Body() dto: CreateOperatorDto, @AuthUser() user: UserProfile) {
    dto.company_id = user.companyId;
    return this.operatorsService.create(dto);
  }

  @Patch(':id')
  @CacheEvict('operators:all', 'operators:{{id}}')
  @OperatorsSwagger.update()
  update(@Param('id') id: string, @Body() dto: UpdateOperatorDto) {
    return this.operatorsService.update(id, dto);
  }

  @Delete(':id')
  @CacheEvict('operators:all', 'operators:{{id}}')
  @OperatorsSwagger.remove()
  remove(@Param('id') id: string) {
    return this.operatorsService.remove(id);
  }
}
