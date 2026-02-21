import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { VerificationCodeService } from './verification-code.service';
import { EMAIL_SERVICE } from '../../common/mailer/email.module';
import { UserProfile, Company, Location } from '../../database/entities';

// Mock argon2
jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  verify: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepo: any;
  let mockCompanyRepo: any;
  let mockLocationRepo: any;
  let mockJwtService: any;
  let mockVerificationCodeService: any;
  let mockEmailService: any;

  const mockUser = {
    id: 'user-uuid',
    email: 'test@example.com',
    password: 'hashed_password',
    firstName: 'John',
    lastName: 'Doe',
    roles: ['admin'],
    companyId: 'company-uuid',
    isActive: true,
    isVerified: true,
  };

  beforeEach(async () => {
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    mockUserRepo = {
      findOne: jest.fn(),
      create: jest.fn((data) => ({ id: 'user-uuid', ...data })),
      save: jest.fn((user) => Promise.resolve(user)),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    mockCompanyRepo = {
      findOne: jest.fn(),
      create: jest.fn((data) => ({ id: 'company-uuid', ...data })),
      save: jest.fn((company) =>
        Promise.resolve({ id: 'company-uuid', ...company }),
      ),
    };

    mockLocationRepo = {
      count: jest.fn().mockResolvedValue(1),
      create: jest.fn((data) => ({ id: 'location-uuid', ...data })),
      save: jest.fn((location) =>
        Promise.resolve({ id: 'location-uuid', ...location }),
      ),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock_token'),
      verify: jest.fn(),
    };

    mockVerificationCodeService = {
      createCode: jest.fn().mockResolvedValue({ code: 'ABC123' }),
      verifyCode: jest.fn().mockResolvedValue(true),
    };

    mockEmailService = {
      sendEmailVerification: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'jwt.accessToken.expiresIn') return '1h';
        if (key === 'jwt.refreshToken.expiresIn') return '7d';
        return 'test-value';
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserProfile),
          useValue: mockUserRepo,
        },
        {
          provide: getRepositoryToken(Company),
          useValue: mockCompanyRepo,
        },
        {
          provide: getRepositoryToken(Location),
          useValue: mockLocationRepo,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: VerificationCodeService,
          useValue: mockVerificationCodeService,
        },
        {
          provide: EMAIL_SERVICE,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return tokens and user on valid credentials', async () => {
      mockUserRepo.createQueryBuilder().getOne.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockUserRepo.createQueryBuilder().getOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    const registerDto = {
      fullName: 'John Doe',
      email: 'new@example.com',
      phone: '1234567890',
      organizationName: 'New Company',
      password: 'password123',
    };

    it('should create a new company, and user', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('message');
      expect(mockCompanyRepo.save).toHaveBeenCalled();
      expect(mockUserRepo.save).toHaveBeenCalled();
      expect(mockVerificationCodeService.createCode).toHaveBeenCalled();
      expect(mockEmailService.sendEmailVerification).toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid code', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...mockUser, isVerified: false });
      mockVerificationCodeService.verifyCode.mockResolvedValue(true);

      const result = await service.verifyEmail('test@example.com', 'ABC123');

      expect(result).toHaveProperty('accessToken');
      expect(mockUserRepo.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid code', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...mockUser, isVerified: false });
      mockVerificationCodeService.verifyCode.mockResolvedValue(false);

      await expect(service.verifyEmail('test@example.com', 'WRONG')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
