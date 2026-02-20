import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from '../modules/departments/dto/department.dto';
import { Department } from '../database/entities';

export const DepartmentsSwagger = {
  findAll: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get all departments for current company' }),
      ApiResponse({
        status: 200,
        description: 'Departments retrieved successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  getFilterOptions: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get available filter options for departments' }),
      ApiResponse({
        status: 200,
        description: 'Filter options retrieved successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  getUniqueValues: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get distinct values for a column in a given table',
      }),
      ApiQuery({
        name: 'table',
        description: 'Target table name',
        example: 'work_orders',
      }),
      ApiQuery({
        name: 'column',
        description: 'Column to get unique values for',
        example: 'current_status',
      }),
      ApiResponse({
        status: 200,
        description: 'Unique values retrieved successfully',
        schema: {
          type: 'array',
          items: { type: 'string' },
        },
      }),
      ApiResponse({ status: 400, description: 'Table or column not allowed' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  findById: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get a department by ID' }),
      ApiParam({ name: 'id', description: 'Department UUID' }),
      ApiResponse({ status: 200, description: 'Department found' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Department not found' }),
      ApiBearerAuth('JWT-auth'),
    ),
  create: () =>
    applyDecorators(
      ApiOperation({ summary: 'Create a new department' }),
      ApiResponse({
        status: 201,
        description: 'Department created successfully',
      }),
      ApiBearerAuth('JWT-auth'),
    ),
  update: () =>
    applyDecorators(
      ApiOperation({ summary: 'Update a department' }),
      ApiParam({ name: 'id', description: 'Department UUID' }),
      ApiResponse({
        status: 200,
        description: 'Department updated successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Department not found' }),
      ApiBearerAuth('JWT-auth'),
    ),
  delete: () =>
    applyDecorators(
      ApiOperation({ summary: 'Delete a department (soft delete)' }),
      ApiParam({ name: 'id', description: 'Department UUID' }),
      ApiResponse({
        status: 200,
        description: 'Department deleted successfully',
      }),
      ApiBearerAuth('JWT-auth'),
    ),
  getOeeSettings: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get OEE settings for a department' }),
      ApiParam({ name: 'id', description: 'Department UUID' }),
      ApiQuery({
        name: 'current',
        required: false,
        type: Boolean,
        description: 'Get only current active setting',
      }),
      ApiResponse({
        status: 200,
        description: 'Settings retrieved successfully',
      }),
      ApiBearerAuth('JWT-auth'),
    ),
  createOeeSetting: () =>
    applyDecorators(
      ApiOperation({ summary: 'Create a new OEE setting for a department' }),
      ApiParam({ name: 'id', description: 'Department UUID' }),
      ApiResponse({ status: 201, description: 'Setting created successfully' }),
      ApiBearerAuth('JWT-auth'),
    ),
  archiveOeeSetting: () =>
    applyDecorators(
      ApiOperation({ summary: 'Archive an OEE setting' }),
      ApiParam({ name: 'id', description: 'Department UUID' }),
      ApiParam({ name: 'settingId', description: 'OEE Setting UUID' }),
      ApiResponse({
        status: 200,
        description: 'Setting archived successfully',
      }),
      ApiBearerAuth('JWT-auth'),
    ),
};
