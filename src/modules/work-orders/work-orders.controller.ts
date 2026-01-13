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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { WorkOrdersService } from './work-orders.service';
import { UserProfile, WorkOrder } from '../../database/entities';
import {
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  CloseWorkOrderDto,
} from './dto/work-order.dto';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { QueryOptions, Paginate } from '../../common/query-options';

@ApiTags('work-orders')
@Controller('work-orders')
@ApiBearerAuth('JWT-auth')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create and start a new work order' })
  @ApiResponse({ status: 201, description: 'Work order created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation error or work order already active',
  })
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
  @ApiOperation({ summary: 'Get all work orders with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Work orders retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Paginate() query: QueryOptions,
    @AuthUser() user: UserProfile,
  ) {
    return this.workOrdersService.findAll(user.companyId, query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active (unclosed) work orders' })
  @ApiResponse({ status: 200, description: 'Active work orders retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findActive(@AuthUser() user: UserProfile): Promise<WorkOrder[]> {
    return this.workOrdersService.findActive(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a work order by ID' })
  @ApiResponse({ status: 200, description: 'Work order found' })
  @ApiResponse({ status: 404, description: 'Work order not found' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<WorkOrder> {
    return this.workOrdersService.findById(id, user.companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a work order' })
  @ApiResponse({ status: 200, description: 'Work order updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Work order not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkOrderDto,
    @AuthUser() user: UserProfile,
  ): Promise<WorkOrder> {
    return this.workOrdersService.update(id, user.companyId, dto, user.id);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close a work order' })
  @ApiResponse({ status: 200, description: 'Work order closed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Work order not found' })
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
  @ApiOperation({ summary: 'Delete a work order' })
  @ApiResponse({ status: 200, description: 'Work order deleted' })
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
