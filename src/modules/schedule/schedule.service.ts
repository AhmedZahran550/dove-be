import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { ScheduleData } from '../../database/entities';
import { ScheduleFile } from '../../database/entities';
import { QueryOptions } from '../../common/query-options';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleData)
    private scheduleDataRepository: Repository<ScheduleData>,
    @InjectRepository(ScheduleFile)
    private scheduleFileRepository: Repository<ScheduleFile>,
  ) {}

  async findScheduleData(
    companyId: string,
    query: QueryOptions & {
      department?: string;
      status?: string;
      search?: string;
    },
  ) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 50, 200);
    const skip = (page - 1) * limit;

    const whereClause: any = { companyId: companyId };

    if (query.department) {
      whereClause.department = query.department;
    }
    if (query.status) {
      whereClause.status = query.status;
    }
    if (query.search) {
      whereClause.woId = ILike(`%${query.search}%`);
    }

    const [data, totalItems] = await this.scheduleDataRepository.findAndCount({
      where: whereClause,
      order: { sequence: 'ASC', woId: 'ASC' },
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

  async findScheduleDataByDepartment(
    companyId: string,
    department: string,
  ): Promise<ScheduleData[]> {
    return this.scheduleDataRepository.find({
      where: { companyId: companyId, department },
      order: { sequence: 'ASC' },
    });
  }

  async findScheduleDataById(
    id: string,
    companyId: string,
  ): Promise<ScheduleData> {
    const scheduleData = await this.scheduleDataRepository.findOne({
      where: { id, companyId: companyId },
    });

    if (!scheduleData) {
      throw new NotFoundException(`Schedule data with ID ${id} not found`);
    }

    return scheduleData;
  }

  async findScheduleDataByWoId(
    woId: string,
    companyId: string,
  ): Promise<ScheduleData | null> {
    return this.scheduleDataRepository.findOne({
      where: { woId: woId, companyId: companyId },
    });
  }

  async getAvailableDepartments(companyId: string): Promise<string[]> {
    const result = await this.scheduleDataRepository
      .createQueryBuilder('sd')
      .select('DISTINCT sd.department', 'department')
      .where('sd.companyId = :companyId', { companyId })
      .andWhere('sd.department IS NOT NULL')
      .getRawMany();

    return result.map((r) => r.department).filter(Boolean);
  }

  async getScheduleFiles(companyId: string): Promise<ScheduleFile[]> {
    return this.scheduleFileRepository.find({
      where: { companyId: companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async getActiveScheduleFile(companyId: string): Promise<ScheduleFile | null> {
    return this.scheduleFileRepository.findOne({
      where: { companyId: companyId, isActive: true },
    });
  }

  async updateScheduleData(
    id: string,
    companyId: string,
    updateData: Partial<ScheduleData>,
  ): Promise<ScheduleData> {
    await this.findScheduleDataById(id, companyId);
    await this.scheduleDataRepository.update(id, updateData);
    return this.findScheduleDataById(id, companyId);
  }
}
