import {
  Controller,
  Get,
  Post,
  Patch,
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
  ApiQuery,
} from '@nestjs/swagger';
import { TimeSegmentsService } from './time-segments.service';
import { TimeSegment } from '../../database/entities';
import {
  CreateTimeSegmentDto,
  UpdateTimeSegmentDto,
  EndTimeSegmentDto,
} from './dto/time-segment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { User } from '../../database/entities';

@ApiTags('time-segments')
@Controller('time-segments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TimeSegmentsController {
  constructor(private readonly timeSegmentsService: TimeSegmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new time segment' })
  async create(
    @Body() dto: CreateTimeSegmentDto,
    @AuthUser() user: User,
  ): Promise<TimeSegment> {
    return this.timeSegmentsService.create(user.companyId, dto);
  }

  @Get('by-work-order/:workOrderId')
  @ApiOperation({ summary: 'Get time segments for a work order' })
  async findByWorkOrder(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    @AuthUser() user: User,
  ): Promise<TimeSegment[]> {
    return this.timeSegmentsService.findByWorkOrder(
      workOrderId,
      user.companyId,
    );
  }

  @Get('active/operator/:operatorId')
  @ApiOperation({ summary: 'Get active time segment for an operator' })
  async findActiveByOperator(
    @Param('operatorId', ParseUUIDPipe) operatorId: string,
    @AuthUser() user: User,
  ): Promise<TimeSegment | null> {
    return this.timeSegmentsService.findActiveByOperator(
      operatorId,
      user.companyId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a time segment by ID' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: User,
  ): Promise<TimeSegment> {
    return this.timeSegmentsService.findById(id, user.companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a time segment' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTimeSegmentDto,
    @AuthUser() user: User,
  ): Promise<TimeSegment> {
    return this.timeSegmentsService.update(id, user.companyId, dto);
  }

  @Post(':id/end')
  @ApiOperation({ summary: 'End a time segment' })
  async endSegment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EndTimeSegmentDto,
    @AuthUser() user: User,
  ): Promise<TimeSegment> {
    return this.timeSegmentsService.endSegment(id, user.companyId, dto);
  }
}
