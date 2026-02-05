import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessStep } from '../../database/entities/process-step.entity';
import { DBService } from '@/database/db.service';
import { QueryConfig, QueryOptions } from '@/common/query-options';
import { FilterOperator } from 'nestjs-paginate';

export const PROCESS_STEPS_PAGINATION_CONFIG: QueryConfig<ProcessStep> = {
  sortableColumns: ['sequence', 'step_name'],
  defaultSortBy: [['sequence', 'ASC']],
  searchableColumns: ['step_name', 'department_id'],
  filterableColumns: {
    company_id: [FilterOperator.EQ],
    department_id: [FilterOperator.EQ],
    is_active: [FilterOperator.EQ],
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
        company_id: companyId,
        department_id: departmentId,
        is_active: true,
      },
      order: {
        sequence: 'ASC',
      },
    });
  }
}
