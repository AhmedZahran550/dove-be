import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

export const LogsSwagger = {
  findAll: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get all logs with pagination' }),
      ApiResponse({ status: 200, description: 'Logs retrieved successfully' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  findOne: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get a log by ID' }),
      ApiParam({ name: 'id', description: 'Log ID' }),
      ApiResponse({ status: 200, description: 'Log found' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Log not found' }),
      ApiBearerAuth('JWT-auth'),
    ),
};
