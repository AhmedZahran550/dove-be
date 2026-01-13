import {
  Controller,
  Get,
  Post,
  Patch,
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
} from '@nestjs/swagger';
import { TimeSegmentsService } from './time-segments.service';
import { TimeSegment } from '../../database/entities';
import {
  CreateTimeSegmentDto,
  UpdateTimeSegmentDto,
  EndTimeSegmentDto,
} from './dto/time-segment.dto';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserProfile } from '../../database/entities';

@ApiTags('time-segments')
@Controller('time-segments')
@ApiBearerAuth('JWT-auth')
export class TimeSegmentsController {
  constructor(private readonly timeSegmentsService: TimeSegmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new time segment' })
  @ApiResponse({
    status: 201,
    description: 'Time segment created successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() dto: CreateTimeSegmentDto,
    @AuthUser() user: UserProfile,
  ): Promise<TimeSegment> {
    return this.timeSegmentsService.create(user.companyId, dto);
  }

  @Get('by-work-order/:workOrderId')
  @ApiOperation({ summary: 'Get time segments for a work order' })
  @ApiResponse({
    status: 200,
    description: 'Time segments retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByWorkOrder(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    @AuthUser() user: UserProfile,
  ): Promise<TimeSegment[]> {
    return this.timeSegmentsService.findByWorkOrder(
      workOrderId,
      user.companyId,
    );
  }

  @Get('active/operator/:operatorId')
  @ApiOperation({ summary: 'Get active time segment for an operator' })
  @ApiResponse({ status: 200, description: 'Active time segment found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findActiveByOperator(
    @Param('operatorId', ParseUUIDPipe) operatorId: string,
    @AuthUser() user: UserProfile,
  ): Promise<TimeSegment | null> {
    return this.timeSegmentsService.findActiveByOperator(
      operatorId,
      user.companyId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a time segment by ID' })
  @ApiResponse({ status: 200, description: 'Time segment found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Time segment not found' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<TimeSegment> {
    return this.timeSegmentsService.findById(id, user.companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a time segment' })
  @ApiResponse({
    status: 200,
    description: 'Time segment updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Time segment not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTimeSegmentDto,
    @AuthUser() user: UserProfile,
  ): Promise<TimeSegment> {
    return this.timeSegmentsService.update(id, user.companyId, dto);
  }

  @Post(':id/end')
  @ApiOperation({ summary: 'End a time segment' })
  @ApiResponse({ status: 200, description: 'Time segment ended successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Time segment not found' })
  async endSegment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EndTimeSegmentDto,
    @AuthUser() user: UserProfile,
  ): Promise<TimeSegment> {
    return this.timeSegmentsService.endSegment(id, user.companyId, dto);
  }
}
