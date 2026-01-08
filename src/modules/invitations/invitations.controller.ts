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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities';

@ApiTags('invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all invitations for current company' })
  async findAll(@CurrentUser() user: User): Promise<Invitation[]> {
    return this.invitationsService.findByCompany(user.company_id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new invitation' })
  async create(
    @Body() dto: CreateInvitationDto,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean; data: Invitation; message: string }> {
    const invitation = await this.invitationsService.create(
      user.company_id,
      user.id,
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

  @Post('accept')
  @ApiOperation({ summary: 'Accept an invitation and create user account' })
  async accept(
    @Body() dto: AcceptInvitationDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.invitationsService.accept(dto);
    return {
      success: true,
      message: 'Invitation accepted successfully',
    };
  }

  @Post(':id/resend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Resend an invitation' })
  async resend(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean; data: Invitation }> {
    const invitation = await this.invitationsService.resend(
      id,
      user.company_id,
    );
    return { success: true, data: invitation };
  }

  @Post(':id/revoke')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Revoke an invitation' })
  async revoke(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean; message: string }> {
    await this.invitationsService.revoke(id, user.company_id);
    return { success: true, message: 'Invitation revoked' };
  }
}

