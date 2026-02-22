import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserProfile } from '../../database/entities';

jest.mock('nestjs-paginate', () => ({
  paginate: jest.fn().mockResolvedValue({
    data: [],
    meta: {
      totalItems: 0,
      itemCount: 0,
      itemsPerPage: 10,
      totalPages: 0,
      currentPage: 1,
    },
    links: {},
  }),
  FilterOperator: { EQ: 'eq' },
  FilterSuffix: { NOT: 'not' },
}));

import { paginate } from 'nestjs-paginate';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepo: any;

  const mockUser = {
    id: 'user-uuid',
    companyId: 'company-uuid',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockUser], 1]),
  };

  beforeEach(async () => {
    mockUserRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      metadata: {
        target: UserProfile,
        columns: [],
        relations: [],
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(UserProfile), useValue: mockUserRepo },
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
      const mockResult = {
        data: [mockUser],
        meta: { totalItems: 1, currentPage: 1 },
      };
      (paginate as jest.Mock).mockResolvedValue(mockResult);

      const mockQuery: any = { path: 'users' };
      const result = await service.findByCompany('company-uuid', mockQuery);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].companyId).toBe('company-uuid');
    });

    it('should return empty result if no users found', async () => {
      (paginate as jest.Mock).mockResolvedValue({ data: [], meta: { totalItems: 0 } });
      const mockQuery: any = { path: 'users' };
      const result = await service.findByCompany('company-uuid', mockQuery);

      expect(result.data).toHaveLength(0);
    });
  });
});
