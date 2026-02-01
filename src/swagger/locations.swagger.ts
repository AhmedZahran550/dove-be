import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateLocationDto } from '../modules/locations/dto/location.dto';

export const LocationsSwagger = {
  create: () =>
    applyDecorators(
      ApiOperation({ summary: 'Create a new location' }),
      ApiResponse({
        status: 201,
        description: 'Location created successfully',
      }),
      ApiResponse({ status: 400, description: 'Validation error' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({
        status: 403,
        description: 'Forbidden - Admin access required',
      }),
      ApiBearerAuth('JWT-auth'),
    ),
  findAll: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get all locations for current company' }),
      ApiResponse({
        status: 200,
        description: 'Locations retrieved successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({
        status: 403,
        description: 'Forbidden - Admin access required',
      }),
      ApiBearerAuth('JWT-auth'),
    ),
};
