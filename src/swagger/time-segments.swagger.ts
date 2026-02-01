import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

export const TimeSegmentsSwagger = {
  create: () =>
    applyDecorators(
      ApiOperation({ summary: 'Create a new time segment' }),
      ApiResponse({
        status: 201,
        description: 'Time segment created successfully',
      }),
      ApiResponse({ status: 400, description: 'Validation error' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  findByWorkOrder: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get time segments for a work order' }),
      ApiParam({ name: 'workOrderId', description: 'Work Order UUID' }),
      ApiResponse({
        status: 200,
        description: 'Time segments retrieved successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  findActiveByOperator: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get active time segment for an operator' }),
      ApiParam({ name: 'operatorId', description: 'Operator UUID' }),
      ApiResponse({ status: 200, description: 'Active time segment found' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  findById: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get a time segment by ID' }),
      ApiParam({ name: 'id', description: 'Time Segment UUID' }),
      ApiResponse({ status: 200, description: 'Time segment found' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Time segment not found' }),
      ApiBearerAuth('JWT-auth'),
    ),
  update: () =>
    applyDecorators(
      ApiOperation({ summary: 'Update a time segment' }),
      ApiParam({ name: 'id', description: 'Time Segment UUID' }),
      ApiResponse({
        status: 200,
        description: 'Time segment updated successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Time segment not found' }),
      ApiBearerAuth('JWT-auth'),
    ),
  endSegment: () =>
    applyDecorators(
      ApiOperation({ summary: 'End a time segment' }),
      ApiParam({ name: 'id', description: 'Time Segment UUID' }),
      ApiResponse({
        status: 200,
        description: 'Time segment ended successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Time segment not found' }),
      ApiBearerAuth('JWT-auth'),
    ),
};
