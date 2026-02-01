import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { WorkOrder } from '../database/entities';

export const WorkOrdersSwagger = {
  create: () =>
    applyDecorators(
      ApiOperation({ summary: 'Create and start a new work order' }),
      ApiResponse({
        status: 201,
        description: 'Work order created successfully',
      }),
      ApiResponse({
        status: 400,
        description: 'Validation error or work order already active',
      }),
      ApiBearerAuth('JWT-auth'),
    ),
  findAll: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get all work orders with pagination' }),
      ApiResponse({
        status: 200,
        description: 'Work orders retrieved successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  findActive: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get all active (unclosed) work orders' }),
      ApiResponse({ status: 200, description: 'Active work orders retrieved' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  findById: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get a work order by ID' }),
      ApiParam({ name: 'id', description: 'Work order UUID' }),
      ApiResponse({ status: 200, description: 'Work order found' }),
      ApiResponse({ status: 404, description: 'Work order not found' }),
      ApiBearerAuth('JWT-auth'),
    ),
  update: () =>
    applyDecorators(
      ApiOperation({ summary: 'Update a work order' }),
      ApiParam({ name: 'id', description: 'Work order UUID' }),
      ApiResponse({
        status: 200,
        description: 'Work order updated successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Work order not found' }),
      ApiBearerAuth('JWT-auth'),
    ),
  close: () =>
    applyDecorators(
      ApiOperation({ summary: 'Close a work order' }),
      ApiParam({ name: 'id', description: 'Work order UUID' }),
      ApiResponse({
        status: 200,
        description: 'Work order closed successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Work order not found' }),
      ApiBearerAuth('JWT-auth'),
    ),
  delete: () =>
    applyDecorators(
      ApiOperation({ summary: 'Delete a work order' }),
      ApiParam({ name: 'id', description: 'Work order UUID' }),
      ApiResponse({ status: 200, description: 'Work order deleted' }),
      ApiBearerAuth('JWT-auth'),
    ),
};
