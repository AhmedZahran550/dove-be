import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import {
  AuthResponseDto,
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  VerifyEmailDto,
  ResendVerificationDto,
  VerifyPasswordDto,
} from '../modules/auth/dto/auth.dto';

export const AuthSwagger = {
  register: () =>
    applyDecorators(
      ApiOperation({ summary: 'Register a new user and organization' }),
      ApiResponse({
        status: 201,
        description: 'User registered successfully',
        type: AuthResponseDto,
      }),
      ApiResponse({
        status: 400,
        description: 'Validation error or user already exists',
      }),
    ),
  login: () =>
    applyDecorators(
      ApiOperation({ summary: 'Login with email and password' }),
      ApiResponse({
        status: 200,
        description: 'Login successful',
        type: AuthResponseDto,
      }),
      ApiResponse({ status: 401, description: 'Invalid credentials' }),
    ),
  refresh: () =>
    applyDecorators(
      ApiOperation({ summary: 'Refresh access token' }),
      ApiResponse({
        status: 200,
        description: 'Tokens refreshed successfully',
        type: AuthResponseDto,
      }),
      ApiResponse({ status: 401, description: 'Invalid refresh token' }),
    ),
  logout: () =>
    applyDecorators(
      ApiOperation({ summary: 'Logout and invalidate refresh token' }),
      ApiResponse({ status: 200, description: 'Logged out successfully' }),
      ApiBearerAuth('JWT-auth'),
    ),
  verifyPassword: () =>
    applyDecorators(
      ApiOperation({ summary: 'Verify current user password' }),
      ApiResponse({
        status: 200,
        description: 'Password is correct',
        schema: {
          type: 'object',
          properties: {
            valid: { type: 'boolean', example: true },
          },
        },
      }),
      ApiResponse({ status: 401, description: 'Invalid credentials' }),
      ApiBearerAuth('JWT-auth'),
    ),
  verifyEmail: () =>
    applyDecorators(
      ApiOperation({ summary: 'Verify email address with token' }),
      ApiResponse({
        status: 200,
        description: 'Email verified successfully, returns auth tokens',
        type: AuthResponseDto,
      }),
      ApiResponse({ status: 400, description: 'Invalid or expired token' }),
    ),
  resendVerification: () =>
    applyDecorators(
      ApiOperation({ summary: 'Resend verification email' }),
      ApiResponse({
        status: 200,
        description: 'Verification email sent if account exists',
      }),
      ApiResponse({ status: 400, description: 'Email already verified' }),
    ),
};
