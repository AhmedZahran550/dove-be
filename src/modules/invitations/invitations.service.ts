import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Invitation, Company, Location } from '../../database/entities';
import { UserProfile } from '../../database/entities';
import { CreateInvitationDto, AcceptInvitationDto } from './dto/invitation.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { addDays } from 'date-fns';
import { EmailService } from '../../common/mailer/email.service';
import { Role } from '../auth/role.model';
import { AuthUserDto } from '../auth/dto/auth-user.dto';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

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
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async create(
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
        company_id: companyId,
        status: 'pending',
        expires_at: MoreThan(new Date()),
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
      company_id: companyId,
      email: dto.email.toLowerCase(),
      role: dto.role,
      location_id: dto.location_id,
      token,
      status: 'pending',
      expires_at: addDays(new Date(), 7),
      invited_by: invitedBy.id, // Use the user ID, not the full object
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
      if (invitation.location_id) {
        const location = await this.locationsRepository.findOne({
          where: { id: invitation.location_id },
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

      // Extract recipient name from email (before @)
      const recipientName = invitation.email
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
      where: { company_id: companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByToken(token: string): Promise<Invitation> {
    const invitation = await this.invitationsRepository.findOne({
      where: { token },
      relations: ['company'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException('This invitation has already been used');
    }

    if (new Date() > invitation.expires_at) {
      throw new BadRequestException('This invitation has expired');
    }

    return invitation;
  }

  async accept(dto: AcceptInvitationDto): Promise<UserProfile> {
    const invitation = await this.findByToken(dto.token);

    // Hash password
    const passwordHash = await argon2.hash(dto.password);

    const user = this.usersRepository.create({
      companyId: invitation.company_id,
      locationId: invitation.location_id,
      email: invitation.email,
      firstName: dto.first_name,
      lastName: dto.last_name,
      roles: [invitation.role],
      password: passwordHash,
      isActive: true,
    });

    const savedUser = await this.usersRepository.save(user);

    // Update invitation status
    await this.invitationsRepository.update(invitation.id, {
      status: 'accepted',
      accepted_at: new Date(),
    });

    return savedUser;
  }

  async resend(id: string, companyId: string) {
    const invitation = await this.invitationsRepository.findOne({
      where: { id, company_id: companyId },
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
        company_id: invitation.company_id,
        location_id: invitation.location_id,
      },
      {
        secret: this.configService.get('jwt.invitationToken.secret'),
        expiresIn: '7d',
      },
    );

    await this.invitationsRepository.update(id, {
      token: newToken,
      status: 'pending',
      expires_at: addDays(new Date(), 7),
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
      where: { id, company_id: companyId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.invitationsRepository.update(id, {
      status: 'revoked',
    });
  }
}
