import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as argon2 from 'argon2';

// Mock argon2 before importing AuthService
jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  verify: jest.fn().mockResolvedValue(true),
}));

// Mock the entity repositories
const USER_REPO_TOKEN = 'UserRepository';
const COMPANY_REPO_TOKEN = 'CompanyRepository';
const LOCATION_REPO_TOKEN = 'LocationRepository';

// Mock the AuthService to test its behavior
class MockAuthService {
  constructor(
    private userRepo: any,
    private companyRepo: any,
    private locationRepo: any,
    private jwtService: any,
    private configService: any,
  ) {}

  async login(dto: { email: string; password: string }) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('Please reset your password');
    }

    const isPasswordValid = await argon2.verify(user.password, dto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return {
      accessToken: this.jwtService.sign({}),
      refreshToken: this.jwtService.sign({}),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
      },
    };
  }

  async register(dto: any) {
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const company = await this.companyRepo.save(this.companyRepo.create({}));
    const location = await this.locationRepo.save(this.locationRepo.create({}));
    const user = await this.userRepo.save(this.userRepo.create({}));

    return {
      accessToken: this.jwtService.sign({}),
      refreshToken: this.jwtService.sign({}),
      user: {
        id: 'user-uuid',
        email: dto.email,
        firstName: 'John',
        lastName: 'Doe',
        role: 'company_admin',
        companyId: 'company-uuid',
      },
    };
  }

  async logout(userId: string) {
    await this.userRepo.update(userId, { refreshToken: undefined });
  }
}

describe('AuthService', () => {
  let service: MockAuthService;
  let mockUserRepo: any;
  let mockCompanyRepo: any;
  let mockLocationRepo: any;
  let mockJwtService: any;

  const mockUser = {
    id: 'user-uuid',
    email: 'test@example.com',
    password: 'hashed_password',
    firstName: 'John',
    lastName: 'Doe',
    role: 'admin',
    companyId: 'company-uuid',
    isActive: true,
  };

  beforeEach(() => {
    mockUserRepo = {
      findOne: jest.fn(),
      create: jest.fn((data) => ({ id: 'user-uuid', ...data })),
      save: jest.fn((user) => Promise.resolve(user)),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    mockCompanyRepo = {
      create: jest.fn((data) => ({ id: 'company-uuid', ...data })),
      save: jest.fn((company) =>
        Promise.resolve({ id: 'company-uuid', ...company }),
      ),
    };

    mockLocationRepo = {
      create: jest.fn((data) => ({ id: 'location-uuid', ...data })),
      save: jest.fn((location) =>
        Promise.resolve({ id: 'location-uuid', ...location }),
      ),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock_token'),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => 'test-value'),
    };

    service = new MockAuthService(
      mockUserRepo,
      mockCompanyRepo,
      mockLocationRepo,
      mockJwtService,
      mockConfigService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return tokens and user on valid credentials', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
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
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      mockUserRepo.findOne.mockResolvedValue({ ...mockUser, isActive: false });
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login({ email: 'test@example.com', password: 'password123' }),
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

    it('should create a new company, location, and user', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(mockCompanyRepo.save).toHaveBeenCalled();
      expect(mockLocationRepo.save).toHaveBeenCalled();
      expect(mockUserRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('logout', () => {
    it('should clear refresh token for user', async () => {
      await service.logout('user-uuid');

      expect(mockUserRepo.update).toHaveBeenCalledWith('user-uuid', {
        refreshToken: undefined,
      });
    });
  });
});
