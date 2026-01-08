import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../../database/entities';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepo: any;

  const mockUser = {
    id: 'user-uuid',
    company_id: 'company-uuid',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'admin',
    is_active: true,
    created_at: new Date(),
  };

  beforeEach(async () => {
    mockUserRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('user-uuid');

      expect(result).toBeDefined();
      expect(result?.id).toBe('user-uuid');
      expect(result?.email).toBe('test@example.com');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.findById('wrong-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null if email not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('wrong@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByCompany', () => {
    it('should return all users for a company', async () => {
      mockUserRepo.find.mockResolvedValue([mockUser]);

      const result = await service.findByCompany('company-uuid');

      expect(result).toHaveLength(1);
      expect(result[0].companyId).toBe('company-uuid');
    });

    it('should return empty array if no users found', async () => {
      mockUserRepo.find.mockResolvedValue([]);

      const result = await service.findByCompany('company-uuid');

      expect(result).toHaveLength(0);
    });
  });
});
