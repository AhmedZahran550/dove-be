import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import {
  CreateInvitationDto,
  AcceptInvitationDto,
} from '@/modules/invitations/dto/invitation.dto';

export const InvitationsSwagger = {
  findAll: () =>
    applyDecorators(
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Get all invitations for current company' }),
      ApiResponse({
        status: 200,
        description: 'Invitations retrieved successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
    ),

  create: () =>
    applyDecorators(
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Create a new invitation' }),
      ApiBody({ type: CreateInvitationDto }),
      ApiResponse({
        status: 201,
        description: 'Invitation created successfully',
      }),
      ApiResponse({ status: 400, description: 'Validation error' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
    ),

  verify: () =>
    applyDecorators(
      ApiOperation({ summary: 'Verify an invitation token' }),
      ApiParam({
        name: 'token',
        description: 'Invitation token',
        type: String,
      }),
      ApiResponse({ status: 200, description: 'Invitation token is valid' }),
      ApiResponse({ status: 404, description: 'Invalid or expired token' }),
    ),

  accept: () =>
    applyDecorators(
      ApiOperation({ summary: 'Accept an invitation and create user account' }),
      ApiBody({ type: AcceptInvitationDto }),
      ApiResponse({
        status: 201,
        description: 'Invitation accepted, user created',
      }),
      ApiResponse({
        status: 400,
        description: 'Invalid invitation or validation error',
      }),
    ),

  resend: () =>
    applyDecorators(
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Resend an invitation' }),
      ApiParam({ name: 'id', description: 'Invitation UUID', type: String }),
      ApiResponse({
        status: 200,
        description: 'Invitation resent successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Invitation not found' }),
    ),

  revoke: () =>
    applyDecorators(
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Revoke an invitation' }),
      ApiParam({ name: 'id', description: 'Invitation UUID', type: String }),
      ApiResponse({
        status: 200,
        description: 'Invitation revoked successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Invitation not found' }),
    ),
};
