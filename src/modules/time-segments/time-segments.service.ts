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

@Injectable()
export class TimeSegmentsService {
  constructor(
    @InjectRepository(TimeSegment)
    private timeSegmentsRepository: Repository<TimeSegment>,
  ) {}

  async create(
    companyId: string,
    dto: CreateTimeSegmentDto,
  ): Promise<TimeSegment> {
    const timeSegment = this.timeSegmentsRepository.create({
      company_id: companyId,
      work_order_id: dto.work_order_id,
      operator_id: dto.operator_id,
      operator_ass_id: dto.operator_ass_id,
      start_time: dto.start_time ? new Date(dto.start_time) : new Date(),
      segment_type: dto.segment_type || 'productive',
      shift_id: dto.shift_id,
      shift_date: dto.shift_date,
      equipment_id: dto.equipment_id,
      is_active: true,
    });

    return this.timeSegmentsRepository.save(timeSegment);
  }

  async findByWorkOrder(
    workOrderId: string,
    companyId: string,
  ): Promise<TimeSegment[]> {
    return this.timeSegmentsRepository.find({
      where: { work_order_id: workOrderId, company_id: companyId },
      relations: ['operator'],
      order: { start_time: 'DESC' },
    });
  }

  async findActiveByOperator(
    operatorId: string,
    companyId: string,
  ): Promise<TimeSegment | null> {
    return this.timeSegmentsRepository.findOne({
      where: {
        operator_id: operatorId,
        company_id: companyId,
        end_time: IsNull(),
        is_active: true,
      },
      relations: ['workOrder'],
    });
  }

  async findById(id: string, companyId: string): Promise<TimeSegment> {
    const timeSegment = await this.timeSegmentsRepository.findOne({
      where: { id, company_id: companyId },
      relations: ['operator', 'workOrder'],
    });

    if (!timeSegment) {
      throw new NotFoundException(`Time segment with ID ${id} not found`);
    }

    return timeSegment;
  }

  async update(
    id: string,
    companyId: string,
    dto: UpdateTimeSegmentDto,
  ): Promise<TimeSegment> {
    await this.findById(id, companyId);

    await this.timeSegmentsRepository.update(id, {
      ...dto,
      end_time: dto.end_time ? new Date(dto.end_time) : undefined,
    });

    return this.findById(id, companyId);
  }

  async endSegment(
    id: string,
    companyId: string,
    dto: EndTimeSegmentDto,
  ): Promise<TimeSegment> {
    const timeSegment = await this.findById(id, companyId);

    if (timeSegment.end_time) {
      throw new BadRequestException('Time segment is already ended');
    }

    const endTime = dto.end_time ? new Date(dto.end_time) : new Date();
    const durationMinutes = Math.round(
      (endTime.getTime() - timeSegment.start_time.getTime()) / (1000 * 60),
    );

    await this.timeSegmentsRepository.update(id, {
      end_time: endTime,
      duration_minutes: durationMinutes,
      qty_produced: dto.qty_produced,
      qty_rejected: dto.qty_rejected,
      notes: dto.notes,
    });

    return this.findById(id, companyId);
  }

  async endAllActiveForWorkOrder(
    workOrderId: string,
    companyId: string,
  ): Promise<void> {
    const activeSegments = await this.timeSegmentsRepository.find({
      where: {
        work_order_id: workOrderId,
        company_id: companyId,
        end_time: IsNull(),
        is_active: true,
      },
    });

    const now = new Date();
    for (const segment of activeSegments) {
      const durationMinutes = Math.round(
        (now.getTime() - segment.start_time.getTime()) / (1000 * 60),
      );
      await this.timeSegmentsRepository.update(segment.id, {
        end_time: now,
        duration_minutes: durationMinutes,
      });
    }
  }
}

