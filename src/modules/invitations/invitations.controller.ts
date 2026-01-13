import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
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
  @ApiResponse({
    status: 200,
    description: 'Invitations retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@AuthUser() user: UserProfile): Promise<Invitation[]> {
    return this.invitationsService.findByCompany(user.companyId);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new invitation' })
  @ApiResponse({ status: 201, description: 'Invitation created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Verify an invitation token' })
  @ApiResponse({ status: 200, description: 'Invitation token is valid' })
  @ApiResponse({ status: 404, description: 'Invalid or expired token' })
  async verify(
    @Param('token') token: string,
  ): Promise<{ valid: boolean; invitation: Invitation }> {
    const invitation = await this.invitationsService.findByToken(token);
    return { valid: true, invitation };
  }

  @Public()
  @Post('accept')
  @ApiOperation({ summary: 'Accept an invitation and create user account' })
  @ApiResponse({
    status: 201,
    description: 'Invitation accepted, user created',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid invitation or validation error',
  })
  async accept(@Body() dto: AcceptInvitationDto) {
    return await this.invitationsService.accept(dto);
  }

  @Post(':id/resend')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Resend an invitation' })
  @ApiResponse({ status: 200, description: 'Invitation resent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
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
  @ApiResponse({ status: 200, description: 'Invitation revoked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async revoke(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: UserProfile,
  ): Promise<{ success: boolean; message: string }> {
    await this.invitationsService.revoke(id, user.companyId);
    return { success: true, message: 'Invitation revoked' };
  }
}
