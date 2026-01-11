import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Invitation,
  UserProfile,
  Company,
  Location,
} from '../../database/entities';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { EmailModule } from '../../common/mailer/email.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitation, UserProfile, Company, Location]),
    EmailModule,
    AuthModule,
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
