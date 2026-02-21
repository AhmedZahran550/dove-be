import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ProfileController } from './profile.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailModule } from '../../common/mailer/email.module';
import {
  UserProfile,
  Company,
  Location,
  VerificationCode,
} from '../../database/entities';
import { SMSService } from './sms.service';
import { VerificationCodeService } from './verification-code.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProfile, Company, Location, VerificationCode]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.accessToken.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.accessToken.expiresIn') || '1h',
        },
      }),
      inject: [ConfigService],
    }),
    EmailModule,
  ],
  controllers: [AuthController, ProfileController],
  providers: [
    AuthService,
    JwtStrategy,
    SMSService,
    VerificationCodeService,
    {
      provide: APP_GUARD,
      useExisting: JwtAuthGuard,
    },
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useExisting: RolesGuard,
    },
    RolesGuard,
  ],
  exports: [AuthService, JwtModule, VerificationCodeService],
})
export class AuthModule {}
