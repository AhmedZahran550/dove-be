import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { DowntimeReason } from '@/database/entities';
import { CreateDowntimeReasonDto } from './dto/create-downtime-reason.dto';
import { UpdateDowntimeReasonDto } from './dto/update-downtime-reason.dto';
import { DBService } from '@/database/db.service';
import { QueryOptions } from '@/common/query-options';

@Injectable()
export class DowntimeReasonsService extends DBService<DowntimeReason> {
  constructor(
    @InjectRepository(DowntimeReason)
    private readonly downtimeReasonRepository: Repository<DowntimeReason>,
  ) {
    super(downtimeReasonRepository);
  }

  async findAllByCompany(
    query: QueryOptions,
    companyId: string,
    departmentId?: string,
    includeCompanyLevel?: boolean,
  ) {
    const qb = this.downtimeReasonRepository
      .createQueryBuilder('downtimeReason')
      .leftJoinAndSelect('downtimeReason.category', 'category')
      .where('downtimeReason.companyId = :companyId', { companyId })
      .orderBy('downtimeReason.displayOrder', 'ASC')
      .addOrderBy('downtimeReason.reasonText', 'ASC');

    if (departmentId) {
      if (includeCompanyLevel) {
        // Fetch reasons for specific department OR those with no department (company level)
        qb.andWhere(
          '(downtimeReason.departmentId = :departmentId OR downtimeReason.departmentId IS NULL)',
          { departmentId },
        );
      } else {
        // Fetch only specific department reasons
        qb.andWhere('downtimeReason.departmentId = :departmentId', {
          departmentId,
        });
      }
    } else {
      // If no department specified, maybe fetch all??
      // Based on requirement, usually we fetch all if no filter is applied,
      // but typically frontend will filter by department.
      // For now, if no departmentId is provided, we return everything for the company.
    }

    return super.findAll(query, qb);
  }
}
