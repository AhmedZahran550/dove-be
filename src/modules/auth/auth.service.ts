import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { UserProfile } from '../../database/entities';
import { Company } from '../../database/entities';
import { Location } from '../../database/entities';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(Location)
    private locationsRepository: Repository<Location>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create company
    const nameParts = dto.fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Generate slug from organization name
    const slug = this.generateSlug(dto.organizationName);

    const company = this.companiesRepository.create({
      name: dto.organizationName,
      slug,
      phone: dto.phone,
      timezone: 'America/Toronto',
      subscription_tier: 'free',
      subscription_status: 'trial',
      trial_ends_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days trial
      max_users: 5,
      max_locations: 1,
      is_active: true,
    });

    const savedCompany = await this.companiesRepository.save(company);

    // Create default location
    const location = this.locationsRepository.create({
      company_id: savedCompany.id,
      name: 'Main Location',
      code: 'MAIN',
      is_active: true,
    });

    const savedLocation = await this.locationsRepository.save(location);
    const user = this.usersRepository.create({
      companyId: savedCompany.id,
      locationId: savedLocation.id,
      email: dto.email.toLowerCase(),
      firstName: firstName,
      lastName: lastName,
      phone: dto.phone,
      role: 'company_admin',
      password: dto.password,
      isActive: true,
    });
    const savedUser = await this.usersRepository.save(user);
    // Generate tokens
    return this.generateTokens(savedUser);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findOne({
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

    // Update last login
    await this.usersRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    return this.generateTokens(user);
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const user = await this.usersRepository.findOneOrFail({
        where: { id: payload.sub },
      });

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {}

  async validateUser(userId: string): Promise<User | null> {
    return this.usersRepository.findOneOrFail({
      where: { id: userId, isActive: true },
    });
  }

  private async generateTokens(user: User): Promise<AuthResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      company_id: user.companyId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.secret'),
      expiresIn: this.configService.get('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiresIn'),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.firstName || '',
        last_name: user.lastName || '',
        role: user.role,
        company_id: user.companyId,
      },
    };
  }

  private generateSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Add random suffix to ensure uniqueness
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${baseSlug}-${randomSuffix}`;
  }
}
