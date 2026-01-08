import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RejectionCategory } from '../../database/entities';
import { RejectionReason } from '../../database/entities';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(RejectionCategory)
    private categoriesRepository: Repository<RejectionCategory>,
    @InjectRepository(RejectionReason)
    private reasonsRepository: Repository<RejectionReason>,
  ) {}

  // Rejection Categories
  async findCategories(
    companyId: string,
    departmentId?: string,
  ): Promise<RejectionCategory[]> {
    const where: any = { company_id: companyId, is_active: true };
    if (departmentId) {
      where.department_id = departmentId;
    }
    return this.categoriesRepository.find({
      where,
      relations: ['reasons'],
      order: { display_order: 'ASC' },
    });
  }

  async findCategoryById(
    id: string,
    companyId: string,
  ): Promise<RejectionCategory> {
    const category = await this.categoriesRepository.findOne({
      where: { id, company_id: companyId },
      relations: ['reasons'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async createCategory(
    companyId: string,
    data: Partial<RejectionCategory>,
  ): Promise<RejectionCategory> {
    const category = this.categoriesRepository.create({
      ...data,
      company_id: companyId,
    });
    return this.categoriesRepository.save(category);
  }

  async updateCategory(
    id: string,
    companyId: string,
    data: Partial<RejectionCategory>,
  ): Promise<RejectionCategory> {
    await this.findCategoryById(id, companyId);
    await this.categoriesRepository.update(id, data);
    return this.findCategoryById(id, companyId);
  }

  async deleteCategory(id: string, companyId: string): Promise<void> {
    await this.findCategoryById(id, companyId);
    await this.categoriesRepository.update(id, { is_active: false });
  }

  // Rejection Reasons
  async findReasons(
    companyId: string,
    categoryId?: string,
  ): Promise<RejectionReason[]> {
    const where: any = { company_id: companyId, is_active: true };
    if (categoryId) {
      where.category_id = categoryId;
    }
    return this.reasonsRepository.find({
      where,
      relations: ['category'],
      order: { display_order: 'ASC' },
    });
  }

  async findReasonById(
    id: string,
    companyId: string,
  ): Promise<RejectionReason> {
    const reason = await this.reasonsRepository.findOne({
      where: { id, company_id: companyId },
      relations: ['category'],
    });
    if (!reason) {
      throw new NotFoundException(`Reason with ID ${id} not found`);
    }
    return reason;
  }

  async createReason(
    companyId: string,
    data: Partial<RejectionReason>,
  ): Promise<RejectionReason> {
    const reason = this.reasonsRepository.create({
      ...data,
      company_id: companyId,
    });
    return this.reasonsRepository.save(reason);
  }

  async updateReason(
    id: string,
    companyId: string,
    data: Partial<RejectionReason>,
  ): Promise<RejectionReason> {
    await this.findReasonById(id, companyId);
    await this.reasonsRepository.update(id, data);
    return this.findReasonById(id, companyId);
  }

  async deleteReason(id: string, companyId: string): Promise<void> {
    await this.findReasonById(id, companyId);
    await this.reasonsRepository.update(id, { is_active: false });
  }
}

