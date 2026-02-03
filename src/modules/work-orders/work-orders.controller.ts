import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WorkOrdersSwagger } from '@/swagger/work-orders.swagger';
import { WorkOrdersService } from './work-orders.service';
import { UserProfile, WorkOrder } from '../../database/entities';
import {
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  CloseWorkOrderDto,
} from './dto/work-order.dto';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { QueryOptions, Paginate } from '../../common/query-options';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';

@ApiTags('work-orders')
@Controller('work-orders')
@Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
@ApiBearerAuth('JWT-auth')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  @WorkOrdersSwagger.create()
  async create(
    @Body() dto: CreateWorkOrderDto,
    @AuthUser() user: UserProfile,
  ): Promise<{ success: boolean; message: string; data: WorkOrder }> {
    const workOrder = await this.workOrdersService.create(user.companyId, dto);
    return {
      success: true,
      message: 'Work order started successfully',
      data: workOrder,
    };
  }

  @Get()
  @WorkOrdersSwagger.findAll()
  async findAll(
    @Paginate() query: QueryOptions,
    @AuthUser() user: UserProfile,
  ) {
    return this.workOrdersService.findAll(user.companyId, query);
  }

  @Get('active')
  @WorkOrdersSwagger.findActive()
  async findActive(@AuthUser() user: UserProfile): Promise<WorkOrder[]> {
    return this.workOrdersService.findActive(user.companyId);
  }

  @Get(':id')
  @WorkOrdersSwagger.findById()
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<WorkOrder> {
    return this.workOrdersService.findById(id, user.companyId);
  }

  @Patch(':id')
  @WorkOrdersSwagger.update()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkOrderDto,
    @AuthUser() user: UserProfile,
  ): Promise<WorkOrder> {
    return this.workOrdersService.update(id, user.companyId, dto, user.id);
  }

  @Post(':id/close')
  @WorkOrdersSwagger.close()
  async close(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CloseWorkOrderDto,
    @AuthUser() user: UserProfile,
  ): Promise<{ success: boolean; message: string; data: WorkOrder }> {
    const workOrder = await this.workOrdersService.close(
      id,
      user.companyId,
      dto,
      user.id,
    );
    return {
      success: true,
      message: 'Work order closed successfully',
      data: workOrder,
    };
  }

  @Delete(':id')
  @WorkOrdersSwagger.delete()
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<{ success: boolean; message: string }> {
    await this.workOrdersService.delete(id, user.companyId);
    return {
      success: true,
      message: 'Work order deleted successfully',
    };
  }
}
