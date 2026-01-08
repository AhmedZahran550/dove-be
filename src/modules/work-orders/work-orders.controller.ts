import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
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
import { WorkOrder } from '../../database/entities';
import {
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  CloseWorkOrderDto,
} from './dto/work-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities';

@ApiTags('work-orders')
@Controller('work-orders')
@UseGuards(JwtAuthGuard)
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
    @CurrentUser() user: User,
  ): Promise<{ success: boolean; message: string; data: WorkOrder }> {
    const workOrder = await this.workOrdersService.create(user.company_id, dto);
    return {
      success: true,
      message: 'Work order started successfully',
      data: workOrder,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all work orders with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('sortBy') sortBy: string = 'created_at:DESC',
    @CurrentUser() user: User,
  ) {
    return this.workOrdersService.findAll(user.company_id, {
      page,
      limit,
      sortBy,
    });
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active (unclosed) work orders' })
  async findActive(@CurrentUser() user: User): Promise<WorkOrder[]> {
    return this.workOrdersService.findActive(user.company_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a work order by ID' })
  @ApiResponse({ status: 200, description: 'Work order found' })
  @ApiResponse({ status: 404, description: 'Work order not found' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<WorkOrder> {
    return this.workOrdersService.findById(id, user.company_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a work order' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkOrderDto,
    @CurrentUser() user: User,
  ): Promise<WorkOrder> {
    return this.workOrdersService.update(id, user.company_id, dto, user.id);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close a work order' })
  async close(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CloseWorkOrderDto,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean; message: string; data: WorkOrder }> {
    const workOrder = await this.workOrdersService.close(
      id,
      user.company_id,
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
    @CurrentUser() user: User,
  ): Promise<{ success: boolean; message: string }> {
    await this.workOrdersService.delete(id, user.company_id);
    return {
      success: true,
      message: 'Work order deleted successfully',
    };
  }
}

