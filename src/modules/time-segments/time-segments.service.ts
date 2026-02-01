import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TimeSegment } from '../../database/entities';
import {
  CreateTimeSegmentDto,
  UpdateTimeSegmentDto,
  EndTimeSegmentDto,
} from './dto/time-segment.dto';
import { DBService } from '@/database/db.service';
import { Paginated, FilterOperator, FilterSuffix } from 'nestjs-paginate';
import { QueryConfig, QueryOptions } from '@/common/query-options';

export const TIME_SEGMENTS_PAGINATION_CONFIG: QueryConfig<TimeSegment> = {
  sortableColumns: ['createdAt', 'updatedAt', 'startTime', 'endTime'],
  defaultSortBy: [['startTime', 'DESC']],
  searchableColumns: ['notes'],
  select: undefined,
  filterableColumns: {
    isActive: [FilterOperator.EQ],
    segmentType: [FilterOperator.EQ],
    workOrderId: [FilterOperator.EQ],
    operatorId: [FilterOperator.EQ],
    companyId: [FilterOperator.EQ],
  },
  relations: ['operator', 'workOrder'],
};

@Injectable()
export class TimeSegmentsService extends DBService<TimeSegment> {
  constructor(
    @InjectRepository(TimeSegment)
    private timeSegmentsRepository: Repository<TimeSegment>,
  ) {
    super(timeSegmentsRepository, TIME_SEGMENTS_PAGINATION_CONFIG);
  }

  async createTimeSegment(
    companyId: string,
    dto: CreateTimeSegmentDto,
  ): Promise<TimeSegment> {
    const timeSegment = this.timeSegmentsRepository.create({
      companyId: companyId,
      workOrderId: dto.work_order_id,
      operatorId: dto.operator_id,
      operatorAssId: dto.operator_ass_id,
      startTime: dto.start_time ? new Date(dto.start_time) : new Date(),
      segmentType: dto.segment_type || 'productive',
      shiftId: dto.shift_id,
      shiftDate: dto.shift_date,
      equipmentId: dto.equipment_id,
      isActive: true,
    });

    return this.timeSegmentsRepository.save(timeSegment);
  }

  async findByWorkOrder(
    workOrderId: string,
    companyId: string,
    query: QueryOptions,
  ): Promise<Paginated<TimeSegment>> {
    const qb = this.timeSegmentsRepository.createQueryBuilder('timeSegment');
    qb.where('timeSegment.workOrderId = :workOrderId', { workOrderId });
    qb.andWhere('timeSegment.companyId = :companyId', { companyId });

    return super.findAll(query, qb);
  }

  async findActiveByOperator(
    operatorId: string,
    companyId: string,
  ): Promise<TimeSegment | null> {
    return this.timeSegmentsRepository.findOne({
      where: {
        operatorId: operatorId,
        companyId: companyId,
        endTime: IsNull(),
        isActive: true,
      },
      relations: ['workOrder'],
    });
  }

  async findTimeSegmentById(
    id: string,
    companyId: string,
  ): Promise<TimeSegment> {
    const timeSegment = await this.timeSegmentsRepository.findOne({
      where: { id, companyId: companyId },
      relations: ['operator', 'workOrder'],
    });

    if (!timeSegment) {
      throw new NotFoundException(`Time segment with ID ${id} not found`);
    }

    return timeSegment;
  }

  async updateTimeSegment(
    id: string,
    companyId: string,
    dto: UpdateTimeSegmentDto,
  ): Promise<TimeSegment> {
    await this.findTimeSegmentById(id, companyId);

    await this.timeSegmentsRepository.update(id, {
      ...dto,
      endTime: dto.end_time ? new Date(dto.end_time) : undefined,
    });

    return this.findTimeSegmentById(id, companyId);
  }

  async endSegment(
    id: string,
    companyId: string,
    dto: EndTimeSegmentDto,
  ): Promise<TimeSegment> {
    const timeSegment = await this.findTimeSegmentById(id, companyId);

    if (timeSegment.endTime) {
      throw new BadRequestException('Time segment is already ended');
    }

    const endTime = dto.end_time ? new Date(dto.end_time) : new Date();
    const durationMinutes = Math.round(
      (endTime.getTime() - timeSegment.startTime.getTime()) / (1000 * 60),
    );

    await this.timeSegmentsRepository.update(id, {
      endTime: endTime,
      durationMinutes: durationMinutes,
      qtyProduced: dto.qty_produced,
      qtyRejected: dto.qty_rejected,
      notes: dto.notes,
    });

    return this.findTimeSegmentById(id, companyId);
  }

  async endAllActiveForWorkOrder(
    workOrderId: string,
    companyId: string,
  ): Promise<void> {
    const activeSegments = await this.timeSegmentsRepository.find({
      where: {
        workOrderId: workOrderId,
        companyId: companyId,
        endTime: IsNull(),
        isActive: true,
      },
    });

    const now = new Date();
    for (const segment of activeSegments) {
      const durationMinutes = Math.round(
        (now.getTime() - segment.startTime.getTime()) / (1000 * 60),
      );
      await this.timeSegmentsRepository.update(segment.id, {
        endTime: now,
        durationMinutes: durationMinutes,
      });
    }
  }
}
