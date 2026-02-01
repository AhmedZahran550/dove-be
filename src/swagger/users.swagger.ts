import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserResponseDto, UpdateUserDto } from '../modules/users/dto/user.dto';

export const UsersSwagger = {
  getProfile: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get current user profile' }),
      ApiResponse({
        status: 200,
        description: 'User profile retrieved successfully',
        type: UserResponseDto,
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth(),
    ),
  findAll: () =>
    applyDecorators(
      ApiOperation({ summary: 'List all users in company' }),
      ApiQuery({ name: 'page', required: false, type: Number }),
      ApiQuery({ name: 'limit', required: false, type: Number }),
      ApiQuery({ name: 'search', required: false, type: String }),
      ApiResponse({
        status: 200,
        description: 'Users retrieved successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth(),
    ),
  findOne: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get user details by ID' }),
      ApiParam({ name: 'id', description: 'User UUID' }),
      ApiResponse({
        status: 200,
        description: 'User details retrieved successfully',
        type: UserResponseDto,
      }),
      ApiResponse({ status: 404, description: 'User not found' }),
      ApiBearerAuth(),
    ),
  update: () =>
    applyDecorators(
      ApiOperation({ summary: 'Update user details' }),
      ApiParam({ name: 'id', description: 'User UUID' }),
      ApiBody({ type: UpdateUserDto }),
      ApiResponse({
        status: 200,
        description: 'User updated successfully',
        type: UserResponseDto,
      }),
      ApiResponse({ status: 404, description: 'User not found' }),
      ApiBearerAuth(),
    ),
  remove: () =>
    applyDecorators(
      ApiOperation({ summary: 'Delete (deactivate) user' }),
      ApiParam({ name: 'id', description: 'User UUID' }),
      ApiResponse({
        status: 200,
        description: 'User deleted successfully',
      }),
      ApiResponse({ status: 404, description: 'User not found' }),
      ApiBearerAuth(),
    ),
};
