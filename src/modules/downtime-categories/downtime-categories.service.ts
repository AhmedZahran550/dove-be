import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DowntimeCategory } from '@/database/entities';
import { CreateDowntimeCategoryDto } from './dto/create-downtime-category.dto';
import { UpdateDowntimeCategoryDto } from './dto/update-downtime-category.dto';
import { DBService } from '@/database/db.service';

@Injectable()
export class DowntimeCategoriesService extends DBService<
  DowntimeCategory,
  CreateDowntimeCategoryDto
> {
  constructor(
    @InjectRepository(DowntimeCategory)
    private readonly downtimeCategoryRepository: Repository<DowntimeCategory>,
  ) {
    super(downtimeCategoryRepository);
  }
}
