import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../../database/entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserProfile)
    private usersRepository: Repository<UserProfile>,
  ) {}

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

  async findByCompany(companyId: string): Promise<UserProfile[]> {
    return this.usersRepository.find({
      where: { companyId: companyId, isActive: true },
      order: { firstName: 'ASC' },
    });
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
}
