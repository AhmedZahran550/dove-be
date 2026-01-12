import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
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
import { ErrorCodes } from '@/common/error-codes';
import { Role } from './role.model';
import { EmailService } from '../../common/mailer/email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserProfile)
    private usersRepository: Repository<UserProfile>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(Location)
    private locationsRepository: Repository<Location>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
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

    const company: Company = this.companiesRepository.create({
      name: dto.organizationName,
      slug,
      phone: dto.phone,
      timezone: 'America/Toronto',
      subscriptionTier: 'free',
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days trial
      maxUsers: 5,
      maxLocations: 1,
      isActive: true,
    });

    const savedCompany = await this.companiesRepository.save(company);

    const user = this.usersRepository.create({
      companyId: savedCompany.id,
      email: dto.email.toLowerCase(),
      firstName: firstName,
      lastName: lastName,
      phone: dto.phone,
      roles: [Role.COMPANY_ADMIN],
      password: dto.password,
      isActive: true,
      isVerified: false, // User needs to verify email
    });
    const savedUser = await this.usersRepository.save(user);

    // Send verification email
    this.sendVerificationEmail(savedUser, dto.organizationName);

    // Generate tokens (user can login but with limited access until verified)
    return {
      message:
        'User registered successfully, check your email for verification',
    };
  }

  /**
   * Generate and send email verification token
   */
  private async sendVerificationEmail(
    user: UserProfile,
    organizationName?: string,
  ): Promise<void> {
    try {
      const verificationToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          type: 'email_verification',
        },
        {
          secret: this.configService.get('jwt.verificationToken.secret'),
          expiresIn: '24h',
        },
      );

      const userName = user.firstName || user.email.split('@')[0];
      await this.emailService.sendEmailVerification(
        user.email,
        userName,
        verificationToken,
        organizationName,
      );
      this.logger.log(`Verification email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${user.email}`,
        error,
      );
      // Don't throw - registration should still succeed
    }
  }

  /**
   * Verify email with token and return auth tokens
   */
  async verifyEmail(token: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('jwt.verificationToken.secret'),
      });

      if (payload.type !== 'email_verification') {
        throw new BadRequestException('Invalid verification token');
      }

      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.isVerified) {
        throw new BadRequestException('Email already verified');
      }

      // Update user as verified
      await this.usersRepository.update(user.id, { isVerified: true });
      user.isVerified = true;

      this.logger.log(`Email verified for user ${user.email}`);

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if user exists or not
      throw new BadRequestException(
        'If an account exists with this email, a verification email will be sent',
      );
    }

    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    await this.sendVerificationEmail(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
      select: ['password', 'id', 'email', 'roles', 'companyId', 'isVerified'],
    });

    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCodes.INVALID_CREDENTIALS,
        message: 'Invalid credentials',
      });
    }

    if (!user.password) {
      throw new UnauthorizedException({
        code: ErrorCodes.INVALID_CREDENTIALS,
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await argon2.verify(user.password, dto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException({
        code: ErrorCodes.INVALID_CREDENTIALS,
        message: 'Invalid credentials',
      });
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

  async validateUser(userId: string): Promise<UserProfile | null> {
    return this.usersRepository.findOneOrFail({
      where: { id: userId, isActive: true },
    });
  }

  private async generateTokens(user: UserProfile): Promise<AuthResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.roles,
      company_id: user.companyId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.accessToken.secret'),
      expiresIn: this.configService.get('jwt.accessToken.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshToken.secret'),
      expiresIn: this.configService.get('jwt.refreshToken.expiresIn'),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        roles: user.roles,
        companyId: user.companyId,
        locationId: user.locationId,
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
