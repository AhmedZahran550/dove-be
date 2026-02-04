import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../../database/entities';
import { DBService } from '@/database/db.service';
import { Paginated, FilterOperator, FilterSuffix } from 'nestjs-paginate';
import { QueryConfig, QueryOptions } from '@/common/query-options';

export const USERS_PAGINATION_CONFIG: QueryConfig<UserProfile> = {
  sortableColumns: ['createdAt', 'updatedAt', 'firstName', 'lastName', 'email'],
  defaultSortBy: [['firstName', 'ASC']],
  searchableColumns: ['firstName', 'lastName', 'email'],
  select: undefined,
  filterableColumns: {
    isActive: [FilterOperator.EQ],
    role: [FilterOperator.EQ],
    'company.id': [FilterOperator.EQ],
  },
  relations: ['company'],
};

@Injectable()
export class UsersService extends DBService<UserProfile> {
  constructor(
    @InjectRepository(UserProfile)
    private usersRepository: Repository<UserProfile>,
  ) {
    super(usersRepository, USERS_PAGINATION_CONFIG);
  }

  async findById(id: string): Promise<UserProfile> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findByCompany(
    companyId: string,
    query: QueryOptions,
  ): Promise<Paginated<UserProfile>> {
    const qb = this.usersRepository.createQueryBuilder('user');
    qb.where('user.companyId = :companyId', { companyId });
    qb.andWhere('user.isActive = :isActive', { isActive: true });
    return super.findAll(query, qb);
  }

  async update(
    id: string,
    updateData: Partial<UserProfile>,
  ): Promise<UserProfile> {
    await this.usersRepository.update(id, updateData);
    return this.findById(id);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  async getPreferences(userId: string): Promise<Record<string, any>> {
    const user = await this.findById(userId);
    return user.preferences || {};
  }

  async updatePreference(
    userId: string,
    key: string,
    value: any,
  ): Promise<Record<string, any>> {
    const user = await this.findById(userId);
    const preferences = user.preferences || {};
    preferences[key] = value;
    await this.usersRepository.update(userId, { preferences });
    return preferences;
  }

  async deletePreference(
    userId: string,
    key: string,
  ): Promise<Record<string, any>> {
    const user = await this.findById(userId);
    const preferences = user.preferences || {};
    if (key in preferences) {
      delete preferences[key];
      await this.usersRepository.update(userId, { preferences });
    }
    return preferences;
  }
}
