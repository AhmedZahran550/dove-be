import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { WorkOrder } from '../../database/entities';
import { Location } from '../../database/entities';
import {
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  CloseWorkOrderDto,
} from './dto/work-order.dto';
import { QueryOptions } from '../../common/query-options';

@Injectable()
export class WorkOrdersService {
  constructor(
    @InjectRepository(WorkOrder)
    private workOrdersRepository: Repository<WorkOrder>,
    @InjectRepository(Location)
    private locationsRepository: Repository<Location>,
  ) {}

  async create(companyId: string, dto: CreateWorkOrderDto): Promise<WorkOrder> {
    // Check if work order already exists and is active
    const existingWO = await this.workOrdersRepository.findOne({
      where: {
        company_id: companyId,
        wo_number: dto.wo_id,
        closing_time: IsNull(),
      },
    });

    if (existingWO) {
      throw new BadRequestException(
        'Work order is already active. Cannot start the same work order twice.',
      );
    }

    // Get default location for the company
    const defaultLocation = await this.locationsRepository.findOne({
      where: { company_id: companyId, is_active: true },
    });

    if (!defaultLocation) {
      throw new BadRequestException('No active location found for company');
    }

    // Parse setup time (HH:MM format to minutes)
    const setupMinutes = this.parseSetupMinutes(dto.setup_time);

    // Validate equipment_id is UUID if provided
    const equipmentId =
      dto.equipment_id && this.isValidUUID(dto.equipment_id)
        ? dto.equipment_id
        : undefined;

    const workOrder = this.workOrdersRepository.create({
      company_id: companyId,
      location_id: defaultLocation.id,
      wo_number: dto.wo_id,
      lot_number: dto.lot_number || dto.part_number,
      bulk_lot_number: dto.bulk_lot_number,
      wo_qty: dto.wo_qty || 1,
      equipment_id: equipmentId,
      setup_time: setupMinutes,
      start_time: dto.start_time ? new Date(dto.start_time) : new Date(),
      current_status: 'running',
      status_updated_at: new Date(),
    });

    return this.workOrdersRepository.save(workOrder);
  }

  async findAll(companyId: string, query: QueryOptions) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    // Parse sortBy (nestjs-paginate returns [[field, direction]] tuples)
    let orderField = 'created_at';
    let orderDirection: 'ASC' | 'DESC' = 'DESC';
    if (query.sortBy && query.sortBy.length > 0) {
      const [field, direction] = query.sortBy[0];
      orderField = field || 'created_at';
      orderDirection = direction?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    }

    const [data, totalItems] = await this.workOrdersRepository.findAndCount({
      where: { company_id: companyId },
      relations: ['location'],
      order: { [orderField]: orderDirection },
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        itemsPerPage: limit,
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findActive(companyId: string): Promise<WorkOrder[]> {
    return this.workOrdersRepository.find({
      where: {
        company_id: companyId,
        closing_time: IsNull(),
      },
      order: { start_time: 'DESC' },
      relations: ['location'],
    });
  }

  async findById(id: string, companyId: string): Promise<WorkOrder> {
    const workOrder = await this.workOrdersRepository.findOne({
      where: { id, company_id: companyId },
      relations: ['location', 'statusUpdatedBy'],
    });

    if (!workOrder) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }

    return workOrder;
  }

  async update(
    id: string,
    companyId: string,
    dto: UpdateWorkOrderDto,
    userId?: string,
  ): Promise<WorkOrder> {
    const workOrder = await this.findById(id, companyId);

    const updateData: Partial<WorkOrder> = { ...dto };

    if (dto.current_status || dto.status_id) {
      updateData.status_updated_at = new Date();
      if (userId) {
        updateData.status_updated_by = userId;
      }
    }

    await this.workOrdersRepository.update(id, updateData);
    return this.findById(id, companyId);
  }

  async close(
    id: string,
    companyId: string,
    dto: CloseWorkOrderDto,
    userId?: string,
  ): Promise<WorkOrder> {
    const workOrder = await this.findById(id, companyId);

    if (workOrder.closing_time) {
      throw new BadRequestException('Work order is already closed');
    }

    const updateData: Partial<WorkOrder> = {
      closing_time: new Date(),
      current_status: 'closed',
      status_updated_at: new Date(),
    };

    if (dto.qty_completed !== undefined) {
      updateData.qty_completed = dto.qty_completed;
    }
    if (dto.qty_rejected !== undefined) {
      updateData.qty_rejected = dto.qty_rejected;
    }
    if (dto.operator_comment) {
      updateData.operator_comment = dto.operator_comment;
    }
    if (userId) {
      updateData.status_updated_by = userId;
    }

    await this.workOrdersRepository.update(id, updateData);
    return this.findById(id, companyId);
  }

  async delete(id: string, companyId: string): Promise<void> {
    const workOrder = await this.findById(id, companyId);
    await this.workOrdersRepository.remove(workOrder);
  }

  private parseSetupMinutes(value?: string): number {
    if (!value) return 0;
    const [hoursStr, minutesStr] = value.split(':');
    const hours = Number(hoursStr ?? '0');
    const minutes = Number(minutesStr ?? '0');
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return 0;
    }
    return Math.max(0, hours * 60 + minutes);
  }

  private isValidUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}
