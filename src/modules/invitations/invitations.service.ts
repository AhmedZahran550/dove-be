import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Invitation } from '../../database/entities';
import { UserProfile } from '../../database/entities';
import { CreateInvitationDto, AcceptInvitationDto } from './dto/invitation.dto';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { addDays } from 'date-fns';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private invitationsRepository: Repository<Invitation>,
    @InjectRepository(UserProfile)
    private usersRepository: Repository<UserProfile>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async create(
    companyId: string,
    invitedBy: string,
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
    const token = randomBytes(32).toString('hex');

    // Create invitation (expires in 7 days)
    const invitation = this.invitationsRepository.create({
      company_id: companyId,
      email: dto.email.toLowerCase(),
      role: dto.role,
      location_id: dto.location_id,
      token,
      status: 'pending',
      expires_at: addDays(new Date(), 7),
      invited_by: invitedBy,
    });

    return this.invitationsRepository.save(invitation);
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
