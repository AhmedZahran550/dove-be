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
import { EquipmentService } from './equipment.service';
import { Equipment } from '../../database/entities';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';
import { EquipmentSwagger } from '@/swagger/equipment.swagger';
import { Paginate, QueryOptions } from '@/common/query-options';

import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserProfile } from '../../database/entities';
import { Cacheable, CacheEvict } from '@/common/decorators/cache.decorator';

@ApiTags('Equipment')
@Controller('equipment')
@Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  @Cacheable({ key: 'equipment:all', ttl: 60 })
  @EquipmentSwagger.findAll()
  findAll(@Paginate() query: QueryOptions) {
    return this.equipmentService.findAll(query);
  }

  @Get('active')
  @Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN, Role.OPERATOR, Role.USER)
  @Cacheable({ key: 'equipment:active', ttl: 300 })
  async getActiveEquipment(@AuthUser() user: UserProfile) {
    const equipment = await this.equipmentService.findAllActive(user.companyId);
    return { success: true, equipment };
  }

  @Get(':id')
  @Cacheable({ key: 'equipment:{{id}}', ttl: 2592000 })
  @EquipmentSwagger.findOne()
  findOne(@Param('id') id: string) {
    return this.equipmentService.findById(id);
  }

  @Post()
  @CacheEvict('equipment:all')
  @EquipmentSwagger.create()
  create(@Body() dto: CreateEquipmentDto, @AuthUser() user: UserProfile) {
    dto.companyId = user.companyId;
    return this.equipmentService.create(dto);
  }

  @Patch(':id')
  @CacheEvict('equipment:all', 'equipment:{{id}}')
  @EquipmentSwagger.update()
  update(@Param('id') id: string, @Body() dto: UpdateEquipmentDto) {
    return this.equipmentService.update(id, dto);
  }

  @Delete(':id')
  @CacheEvict('equipment:all', 'equipment:{{id}}')
  @EquipmentSwagger.remove()
  remove(@Param('id') id: string) {
    return this.equipmentService.remove(id);
  }
}
