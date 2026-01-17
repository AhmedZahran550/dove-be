import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '@/database/entities';
import { DBService } from '@/database/db.service';
import { CreatePlanDto, UpdatePlanDto } from './dto';

@Injectable()
export class PlansService extends DBService<Plan> {
  constructor(
    @InjectRepository(Plan)
    private plansRepository: Repository<Plan>,
  ) {
    super(plansRepository);
  }

  async createPlan(dto: CreatePlanDto): Promise<Plan> {
    // Check if plan code already exists
    const existing = await this.plansRepository.findOne({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(
        `Plan with code '${dto.code}' already exists`,
      );
    }

    const plan = this.plansRepository.create({
      ...dto,
      features: dto.features || [],
    });

    return this.plansRepository.save(plan);
  }

  async findByCode(code: string): Promise<Plan | null> {
    return this.plansRepository.findOne({
      where: { code },
    });
  }

  async findActivePlans(): Promise<Plan[]> {
    return this.plansRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findActivePlansForCompany(hasUsedFreeTrial: boolean): Promise<Plan[]> {
    const plans = await this.findActivePlans();

    // Filter out free trial if company has already used it
    if (hasUsedFreeTrial) {
      return plans.filter((plan) => !plan.isFreeTrial);
    }

    return plans;
  }

  async updatePlan(id: string, dto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.findById(id);

    if (!plan) {
      throw new NotFoundException(`Plan with ID '${id}' not found`);
    }

    // Check for code uniqueness if code is being updated
    if (dto.code && dto.code !== plan.code) {
      const existing = await this.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(
          `Plan with code '${dto.code}' already exists`,
        );
      }
    }

    Object.assign(plan, dto);
    return this.plansRepository.save(plan);
  }

  async deletePlan(id: string): Promise<void> {
    const plan = await this.findById(id);

    if (!plan) {
      throw new NotFoundException(`Plan with ID '${id}' not found`);
    }

    // Soft delete
    await this.plansRepository.softDelete(id);
  }

  async checkFeatureAccess(
    planId: string,
    featureName: string,
  ): Promise<boolean> {
    const plan = await this.findById(planId);

    if (!plan) {
      return false;
    }

    return plan.features.includes(featureName);
  }
}
