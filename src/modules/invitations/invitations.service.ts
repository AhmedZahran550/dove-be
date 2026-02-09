import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, DataSource } from 'typeorm';
import { Invitation, Company, Location } from '../../database/entities';
import { UserProfile } from '../../database/entities';
import { CreateInvitationDto, AcceptInvitationDto } from './dto/invitation.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { addDays } from 'date-fns';
import { EmailService } from '../../common/mailer/email.service';
import { EMAIL_SERVICE } from '../../common/mailer/email.module';
import { Role } from '../auth/role.model';
import { AuthUserDto } from '../auth/dto/auth-user.dto';
import { DBService } from '@/database/db.service';
import { AuthService } from '../auth/auth.service';
import { InvitationStatus } from '@/database/entities/invitation.entity';

@Injectable()
export class InvitationsService extends DBService<Invitation> {
  constructor(
    @InjectRepository(Invitation)
    private invitationsRepository: Repository<Invitation>,
    @InjectRepository(UserProfile)
    private usersRepository: Repository<UserProfile>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(Location)
    private locationsRepository: Repository<Location>,
    private jwtService: JwtService,
    private dataSource: DataSource,
    private configService: ConfigService,
    @Inject(EMAIL_SERVICE) private emailService: EmailService,
  ) {
    super(invitationsRepository);
  }

  async createInvitation(
    companyId: string,
    invitedBy: AuthUserDto,
    dto: CreateInvitationDto,
  ): Promise<Invitation> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Check for existing pending invitation
    const existingInvitation = await this.invitationsRepository.findOne({
      where: {
        email: dto.email.toLowerCase(),
        companyId: companyId,
        status: InvitationStatus.PENDING,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (existingInvitation) {
      throw new BadRequestException(
        'An invitation has already been sent to this email',
      );
    }

    // Generate unique token
    const token = this.jwtService.sign(
      {
        email: dto.email.toLowerCase(),
        role: dto.role,
        location_id: dto.location_id,
      },
      {
        secret: this.configService.get('jwt.invitationToken.secret'),
        expiresIn: '7d',
      },
    );

    // Create invitation (expires in 7 days)
    const invitation = this.invitationsRepository.create({
      companyId: companyId,
      email: dto.email.toLowerCase(),
      fullName: (dto.firstName || '') + ' ' + (dto.lastName || ''),
      customMessage: dto.message,
      role: dto.role,
      locationId: dto.location_id,
      token,
      expiresAt: addDays(new Date(), 7),
      invitedBy: invitedBy.id, // Use the user ID, not the full object
    });

    const savedInvitation = await this.invitationsRepository.save(invitation);

    // Fetch company for email
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
    });

    // Send invitation email
    await this.sendInvitationEmailForInvitation(
      savedInvitation,
      invitedBy,
      company?.name,
    );
    delete savedInvitation.token;
    return savedInvitation;
  }

  /**
   * Helper method to send invitation email with all necessary data
   */
  private async sendInvitationEmailForInvitation(
    invitation: Invitation,
    inviter: AuthUserDto | UserProfile | null,
    companyName?: string,
  ): Promise<void> {
    try {
      // Get location name if applicable
      let locationName: string | undefined;
      if (invitation.locationId) {
        const location = await this.locationsRepository.findOne({
          where: { id: invitation.locationId },
        });
        locationName = location?.name;
      }

      // Build sender name
      let senderName = 'Administrator';
      if (inviter) {
        const firstName = 'firstName' in inviter ? inviter.firstName : '';
        const lastName = 'lastName' in inviter ? inviter.lastName : '';
        senderName = `${firstName} ${lastName}`.trim() || 'Administrator';
      }

      // Use fullName from invitation if available, otherwise extract from email
      const recipientName =
        invitation.fullName ||
        invitation.email
          .split('@')[0]
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());

      // Determine organization name
      const organizationName =
        companyName || invitation.company?.name || 'the organization';

      await this.emailService.sendInvitationEmail({
        recipientEmail: invitation.email,
        recipientName: recipientName,
        senderName: senderName,
        organizationName: organizationName,
        invitationType:
          invitation.role === Role.LOCATION_ADMIN ? 'location_admin' : 'user',
        invitationToken: invitation.token,
        locationName: locationName,
        role: invitation.role,
        customMessage: invitation.customMessage,
      });

      this.logger.log(`Invitation email sent to ${invitation.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send invitation email to ${invitation.email}`,
        error,
      );
      // Don't throw - invitation is still created, email failure shouldn't rollback
    }
  }

  async findByCompany(companyId: string): Promise<Invitation[]> {
    return this.invitationsRepository.find({
      where: { companyId: companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByToken(token: string): Promise<Invitation> {
    const { email } = this.jwtService.verify(token, {
      secret: this.configService.get('jwt.invitationToken.secret'),
    });
    const invitation = await this.invitationsRepository.findOne({
      where: { email },
      relations: ['company'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('This invitation has already been used');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('This invitation has expired');
    }

    return invitation;
  }

  async accept(dto: AcceptInvitationDto) {
    const queryRunner = await this.startTransaction(this.dataSource);
    try {
      const invitation = await this.findByToken(dto.token);
      const user = queryRunner.manager.create(UserProfile, {
        companyId: invitation.companyId,
        locationId: invitation.locationId,
        email: invitation.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        roles: [invitation.role],
        password: dto.password,
        isVerified: true,
        isActive: true,
      });
      await queryRunner.manager.save(user);
      await this.update(
        invitation.id,
        {
          status: InvitationStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
        { manager: queryRunner.manager },
      );
      await queryRunner.commitTransaction();
      return { message: 'Invitation accepted successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async resend(id: string, companyId: string) {
    const invitation = await this.invitationsRepository.findOne({
      where: { id, companyId: companyId },
      relations: ['company', 'invitedByUser'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Generate new token and extend expiry
    const newToken = this.jwtService.sign(
      {
        id: invitation.id,
        role: invitation.role,
        companyId: invitation.companyId,
        location_id: invitation.locationId,
      },
      {
        secret: this.configService.get('jwt.invitationToken.secret'),
        expiresIn: '7d',
      },
    );

    await this.invitationsRepository.update(id, {
      token: newToken,
      status: InvitationStatus.PENDING,
      expiresAt: addDays(new Date(), 7),
    });

    // Resend email with updated token
    await this.sendInvitationEmailForInvitation(
      { ...invitation, token: newToken },
      invitation.invitedByUser,
      invitation.company?.name,
    );
  }

  async revoke(id: string, companyId: string): Promise<void> {
    const invitation = await this.invitationsRepository.findOne({
      where: { id, companyId: companyId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.invitationsRepository.update(id, {
      status: InvitationStatus.REJECTED,
    });
  }
}
