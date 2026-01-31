import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { Invitation } from '../../database/entities';
import { CreateInvitationDto, AcceptInvitationDto } from './dto/invitation.dto';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserProfile } from '../../database/entities';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';
import { AuthUserDto } from '../auth/dto/auth-user.dto';
import { Public } from '../auth/decorators/public.decorator';
import { InvitationsSwagger } from '@/swagger';

@Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
@ApiTags('invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get()
  @InvitationsSwagger.findAll()
  async findAll(@AuthUser() user: UserProfile): Promise<Invitation[]> {
    return this.invitationsService.findByCompany(user.companyId);
  }

  @Post()
  @InvitationsSwagger.create()
  async create(
    @Body() dto: CreateInvitationDto,
    @AuthUser() user: AuthUserDto,
  ): Promise<{ success: boolean; data: Invitation; message: string }> {
    const invitation = await this.invitationsService.createInvitation(
      user.companyId,
      user,
      dto,
    );
    return {
      success: true,
      data: invitation,
      message: 'Invitation created successfully',
    };
  }

  @Public()
  @Get('verify/:token')
  @InvitationsSwagger.verify()
  async verify(
    @Param('token') token: string,
  ): Promise<{ valid: boolean; invitation: Invitation }> {
    const invitation = await this.invitationsService.findByToken(token);
    return { valid: true, invitation };
  }

  @Public()
  @Post('accept')
  @InvitationsSwagger.accept()
  async accept(@Body() dto: AcceptInvitationDto) {
    return await this.invitationsService.accept(dto);
  }

  @Post(':id/resend')
  @InvitationsSwagger.resend()
  async resend(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<{ success: boolean }> {
    await this.invitationsService.resend(id, user.companyId);
    return { success: true };
  }

  @Post(':id/revoke')
  @InvitationsSwagger.revoke()
  async revoke(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<{ success: boolean; message: string }> {
    await this.invitationsService.revoke(id, user.companyId);
    return { success: true, message: 'Invitation revoked' };
  }
}
