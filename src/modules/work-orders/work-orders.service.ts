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
        companyId: companyId,
        woNumber: dto.woId,
        closingTime: IsNull(),
      },
    });

    if (existingWO) {
      throw new BadRequestException(
        'Work order is already active. Cannot start the same work order twice.',
      );
    }

    // Get default location for the company
    const defaultLocation = await this.locationsRepository.findOne({
      where: { companyId: companyId, isActive: true },
    });

    if (!defaultLocation) {
      throw new BadRequestException('No active location found for company');
    }

    // Parse setup time (HH:MM format to minutes)
    const setupMinutes = this.parseSetupMinutes(dto.setupTime);

    // Validate equipmentId is UUID if provided
    const equipmentId =
      dto.equipmentId && this.isValidUUID(dto.equipmentId)
        ? dto.equipmentId
        : undefined;

    const workOrder = this.workOrdersRepository.create({
      companyId: companyId,
      locationId: defaultLocation.id,
      woNumber: dto.woId,
      lotNumber: dto.lotNumber || dto.partNumber,
      bulkLotNumber: dto.bulkLotNumber,
      woQty: dto.woQty || 1,
      equipmentId: equipmentId,
      setupTime: setupMinutes,
      startTime: dto.startTime ? new Date(dto.startTime) : new Date(),
      currentStatus: 'running',
      statusUpdatedAt: new Date(),
      scheduleRow: {
        id: dto.scheduleRowId,
      },
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
      where: { companyId: companyId },
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
        companyId: companyId,
        closingTime: IsNull(),
      },
      order: { startTime: 'DESC' },
      relations: ['location'],
    });
  }

  async findById(id: string, companyId: string): Promise<WorkOrder> {
    const workOrder = await this.workOrdersRepository.findOne({
      where: { woNumber: id, companyId: companyId },
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

    const updateData = { ...dto };

    if (dto.currentStatus || dto.statusId) {
      updateData.statusUpdatedAt = new Date();
      if (userId) {
        updateData.statusUpdatedBy = userId;
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

    if (workOrder.closingTime) {
      throw new BadRequestException('Work order is already closed');
    }

    const updateData: Partial<WorkOrder> = {
      closingTime: new Date(),
      currentStatus: 'closed',
      statusUpdatedAt: new Date(),
    };

    if (dto.qtyCompleted !== undefined) {
      updateData.qtyCompleted = dto.qtyCompleted;
    }
    if (dto.qtyRejected !== undefined) {
      updateData.qtyRejected = dto.qtyRejected;
    }
    if (dto.operatorComment) {
      updateData.operatorComment = dto.operatorComment;
    }
    if (userId) {
      updateData.statusUpdatedBy = userId;
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
