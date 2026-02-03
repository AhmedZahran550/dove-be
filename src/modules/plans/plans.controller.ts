import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { CreatePlanDto, UpdatePlanDto } from './dto';
import { PlansSwagger } from '@/swagger/plans.swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';

@ApiTags('plans')
@Controller('plans')
@ApiBearerAuth('JWT-auth')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post()
  @PlansSwagger.create()
  async create(@Body() dto: CreatePlanDto) {
    return this.plansService.createPlan(dto);
  }

  @Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN, Role.ADMIN, Role.SUPER_ADMIN)
  @Get()
  @PlansSwagger.findAll()
  async findAll() {
    return this.plansService.findActivePlans();
  }

  @Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN, Role.ADMIN, Role.SUPER_ADMIN)
  @Get(':id')
  @PlansSwagger.findOne()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.plansService.findById(id);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Put(':id')
  @PlansSwagger.update()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.plansService.updatePlan(id, dto);
  }

  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  @PlansSwagger.remove()
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.plansService.deletePlan(id);
    return { message: 'Plan deleted successfully' };
  }
}
