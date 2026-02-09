import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessStep } from '../../database/entities/process-step.entity';
import { DBService } from '@/database/db.service';
import { QueryConfig, QueryOptions } from '@/common/query-options';
import { FilterOperator } from 'nestjs-paginate';

export const PROCESS_STEPS_PAGINATION_CONFIG: QueryConfig<ProcessStep> = {
  sortableColumns: ['sequence', 'stepName'],
  defaultSortBy: [['sequence', 'ASC']],
  searchableColumns: ['stepName', 'departmentId'],
  filterableColumns: {
    companyId: [FilterOperator.EQ],
    departmentId: [FilterOperator.EQ],
    isActive: [FilterOperator.EQ],
  },
};

@Injectable()
export class ProcessStepsService extends DBService<ProcessStep> {
  constructor(
    @InjectRepository(ProcessStep)
    private readonly processStepRepository: Repository<ProcessStep>,
  ) {
    super(processStepRepository, PROCESS_STEPS_PAGINATION_CONFIG);
  }

  async findByDepartment(
    companyId: string,
    departmentId: string,
  ): Promise<ProcessStep[]> {
    return this.processStepRepository.find({
      where: {
        companyId: companyId,
        departmentId: departmentId,
        isActive: true,
      },
      order: {
        sequence: 'ASC',
      },
    });
  }
}
