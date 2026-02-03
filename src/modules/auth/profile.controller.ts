import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthUser } from './decorators/auth-user.decorator';
import { UserProfile } from '../../database/entities';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ProfileResponseDto } from './dto/profile-response.dto';

@ApiTags('profile')
@Controller('profile')
@ApiBearerAuth('JWT-auth')
export class ProfileController {
  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: ProfileResponseDto,
  })
  async getProfile(@AuthUser() user: UserProfile) {
    return {
      success: true,
      data: {
        companyId: user.companyId,
        id: user.id,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
      },
    };
  }
}
