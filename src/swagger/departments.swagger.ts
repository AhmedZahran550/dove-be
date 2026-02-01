import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
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
};
