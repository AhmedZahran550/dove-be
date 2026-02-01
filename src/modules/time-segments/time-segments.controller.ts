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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TimeSegmentsSwagger } from '@/swagger/time-segments.swagger';
import { TimeSegmentsService } from './time-segments.service';
import { TimeSegment } from '../../database/entities';
import {
  CreateTimeSegmentDto,
  UpdateTimeSegmentDto,
  EndTimeSegmentDto,
} from './dto/time-segment.dto';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserProfile } from '../../database/entities';
import { Cacheable, CacheEvict } from '@/common/decorators/cache.decorator';
import { Paginate, QueryOptions } from '@/common/query-options';

@ApiTags('time-segments')
@Controller('time-segments')
@ApiBearerAuth('JWT-auth')
export class TimeSegmentsController {
  constructor(private readonly timeSegmentsService: TimeSegmentsService) {}

  @Post()
  @CacheEvict(
    'time-segments:all',
    'time-segments:work-order:{{dto.work_order_id}}',
  )
  @TimeSegmentsSwagger.create()
  async create(
    @Body() dto: CreateTimeSegmentDto,
    @AuthUser() user: UserProfile,
  ): Promise<TimeSegment> {
    return this.timeSegmentsService.createTimeSegment(user.companyId, dto);
  }

  @Get('by-work-order/:workOrderId')
  @Cacheable({ key: 'time-segments:work-order:{{workOrderId}}', ttl: 10 })
  @TimeSegmentsSwagger.findByWorkOrder()
  async findByWorkOrder(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    @AuthUser() user: UserProfile,
    @Paginate() query: QueryOptions,
  ) {
    return this.timeSegmentsService.findByWorkOrder(
      workOrderId,
      user.companyId,
      query,
    );
  }

  @Get('active/operator/:operatorId')
  @TimeSegmentsSwagger.findActiveByOperator()
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
  @Cacheable({ key: 'time-segments:{{id}}', ttl: 2592000 })
  @TimeSegmentsSwagger.findById()
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<TimeSegment> {
    return this.timeSegmentsService.findTimeSegmentById(id, user.companyId);
  }

  @Patch(':id')
  @CacheEvict('time-segments:all', 'time-segments:{{id}}')
  @TimeSegmentsSwagger.update()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTimeSegmentDto,
    @AuthUser() user: UserProfile,
  ): Promise<TimeSegment> {
    return this.timeSegmentsService.updateTimeSegment(id, user.companyId, dto);
  }

  @Post(':id/end')
  @CacheEvict('time-segments:all', 'time-segments:{{id}}')
  @TimeSegmentsSwagger.endSegment()
  async endSegment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EndTimeSegmentDto,
    @AuthUser() user: UserProfile,
  ): Promise<TimeSegment> {
    return this.timeSegmentsService.endSegment(id, user.companyId, dto);
  }
}
