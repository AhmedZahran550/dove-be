import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

export const SettingsSwagger = {
  getCategories: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get all rejection categories' }),
      ApiQuery({ name: 'departmentId', required: false }),
      ApiResponse({
        status: 200,
        description: 'Categories retrieved successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  getCategoryById: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get a rejection category by ID' }),
      ApiParam({ name: 'id', description: 'Category UUID' }),
      ApiResponse({ status: 200, description: 'Category found' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Category not found' }),
      ApiBearerAuth('JWT-auth'),
    ),
  createCategory: () =>
    applyDecorators(
      ApiOperation({ summary: 'Create a rejection category' }),
      ApiResponse({
        status: 201,
        description: 'Category created successfully',
      }),
      ApiResponse({ status: 400, description: 'Validation error' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  updateCategory: () =>
    applyDecorators(
      ApiOperation({ summary: 'Update a rejection category' }),
      ApiParam({ name: 'id', description: 'Category UUID' }),
      ApiResponse({
        status: 200,
        description: 'Category updated successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Category not found' }),
      ApiBearerAuth('JWT-auth'),
    ),
  deleteCategory: () =>
    applyDecorators(
      ApiOperation({ summary: 'Delete a rejection category' }),
      ApiParam({ name: 'id', description: 'Category UUID' }),
      ApiResponse({
        status: 200,
        description: 'Category deleted successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Category not found' }),
      ApiBearerAuth('JWT-auth'),
    ),
  getReasons: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get all rejection reasons' }),
      ApiQuery({ name: 'categoryId', required: false }),
      ApiResponse({
        status: 200,
        description: 'Reasons retrieved successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  getReasonById: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get a rejection reason by ID' }),
      ApiParam({ name: 'id', description: 'Reason UUID' }),
      ApiResponse({ status: 200, description: 'Reason found' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Reason not found' }),
      ApiBearerAuth('JWT-auth'),
    ),
  createReason: () =>
    applyDecorators(
      ApiOperation({ summary: 'Create a rejection reason' }),
      ApiResponse({ status: 201, description: 'Reason created successfully' }),
      ApiResponse({ status: 400, description: 'Validation error' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  updateReason: () =>
    applyDecorators(
      ApiOperation({ summary: 'Update a rejection reason' }),
      ApiParam({ name: 'id', description: 'Reason UUID' }),
      ApiResponse({ status: 200, description: 'Reason updated successfully' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Reason not found' }),
      ApiBearerAuth('JWT-auth'),
    ),
  deleteReason: () =>
    applyDecorators(
      ApiOperation({ summary: 'Delete a rejection reason' }),
      ApiParam({ name: 'id', description: 'Reason UUID' }),
      ApiResponse({ status: 200, description: 'Reason deleted successfully' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Reason not found' }),
      ApiBearerAuth('JWT-auth'),
    ),
};
