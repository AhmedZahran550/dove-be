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
  ): Promise<TimeSegment[]> {
    return this.timeSegmentsRepository.find({
      where: { workOrderId: workOrderId, companyId: companyId },
      relations: ['operator'],
      order: { startTime: 'DESC' },
    });
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

  async findById(id: string, companyId: string): Promise<TimeSegment> {
    const timeSegment = await this.timeSegmentsRepository.findOne({
      where: { id, companyId: companyId },
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
      endTime: dto.end_time ? new Date(dto.end_time) : undefined,
    });

    return this.findById(id, companyId);
  }

  async endSegment(
    id: string,
    companyId: string,
    dto: EndTimeSegmentDto,
  ): Promise<TimeSegment> {
    const timeSegment = await this.findById(id, companyId);

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

    return this.findById(id, companyId);
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
