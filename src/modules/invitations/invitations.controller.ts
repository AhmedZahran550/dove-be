import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { Invitation } from '../../database/entities';
import { CreateInvitationDto, AcceptInvitationDto } from './dto/invitation.dto';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserProfile } from '../../database/entities';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.model';
import { AuthUserDto } from '../auth/dto/auth-user.dto';
import { Public } from '../auth/decorators/public.decorator';

@Roles(Role.COMPANY_ADMIN, Role.LOCATION_ADMIN)
@ApiTags('invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all invitations for current company' })
  async findAll(@AuthUser() user: UserProfile): Promise<Invitation[]> {
    return this.invitationsService.findByCompany(user.companyId);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new invitation' })
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

  @Get('verify/:token')
  @ApiOperation({ summary: 'Verify an invitation token' })
  async verify(
    @Param('token') token: string,
  ): Promise<{ valid: boolean; invitation: Invitation }> {
    const invitation = await this.invitationsService.findByToken(token);
    return { valid: true, invitation };
  }

  @Public()
  @Post('accept')
  @ApiOperation({ summary: 'Accept an invitation and create user account' })
  async accept(@Body() dto: AcceptInvitationDto) {
    return await this.invitationsService.accept(dto);
  }

  @Post(':id/resend')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Resend an invitation' })
  async resend(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<{ success: boolean }> {
    await this.invitationsService.resend(id, user.companyId);
    return { success: true };
  }

  @Post(':id/revoke')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Revoke an invitation' })
  async revoke(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<{ success: boolean; message: string }> {
    await this.invitationsService.revoke(id, user.companyId);
    return { success: true, message: 'Invitation revoked' };
  }
}
