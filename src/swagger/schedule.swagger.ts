import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ScheduleFile, ScheduleData } from '../database/entities';
import { ImportResultDto } from '../modules/schedule/dto/schedule-import.dto';

export const ScheduleSwagger = {
  saveConfig: () =>
    applyDecorators(
      ApiOperation({ summary: 'Save schedule file configuration' }),
      ApiResponse({
        status: 201,
        description: 'Configuration saved successfully',
      }),
      ApiResponse({ status: 400, description: 'Validation error' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({
        status: 403,
        description: 'Forbidden - Admin access required',
      }),
      ApiBearerAuth('JWT-auth'),
    ),
  importFile: () =>
    applyDecorators(
      ApiOperation({ summary: 'Upload and import schedule file' }),
      ApiConsumes('multipart/form-data'),
      ApiBody({
        schema: {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              format: 'binary',
              description: 'Excel or CSV file to import',
            },
            scheduleFileId: {
              type: 'string',
              format: 'uuid',
              description: 'Optional schedule file ID to associate with',
            },
          },
        },
      }),
      ApiResponse({
        status: 201,
        description: 'Import completed successfully',
        type: ImportResultDto,
      }),
      ApiResponse({
        status: 400,
        description: 'Invalid file or no data found',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({
        status: 403,
        description: 'Forbidden - Admin access required',
      }),
      ApiBearerAuth('JWT-auth'),
    ),
  findScheduleData: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get schedule data with pagination and filters',
      }),
      ApiQuery({ name: 'page', required: false, type: Number }),
      ApiQuery({ name: 'limit', required: false, type: Number }),
      ApiQuery({ name: 'department', required: false, type: String }),
      ApiQuery({ name: 'status', required: false, type: String }),
      ApiQuery({ name: 'search', required: false, type: String }),
      ApiResponse({
        status: 200,
        description: 'Schedule data retrieved successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  findByDepartment: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get schedule data for a specific department' }),
      ApiParam({ name: 'department', description: 'Department name' }),
      ApiResponse({
        status: 200,
        description: 'Department schedule data retrieved',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  findByWoId: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get schedule data by work order ID' }),
      ApiParam({ name: 'woId', description: 'Work order ID' }),
      ApiResponse({ status: 200, description: 'Schedule data found' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Schedule data not found' }),
      ApiBearerAuth('JWT-auth'),
    ),
  findById: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get schedule data by ID' }),
      ApiResponse({ status: 200, description: 'Schedule data found' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Schedule data not found' }),
      ApiBearerAuth('JWT-auth'),
    ),
  updateScheduleData: () =>
    applyDecorators(
      ApiOperation({ summary: 'Update schedule data' }),
      ApiResponse({
        status: 200,
        description: 'Schedule data updated successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Schedule data not found' }),
      ApiBearerAuth('JWT-auth'),
    ),
  getDepartments: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get available departments from schedule data' }),
      ApiResponse({
        status: 200,
        description: 'Departments retrieved successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  getScheduleFiles: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get all schedule files' }),
      ApiResponse({
        status: 200,
        description: 'Schedule files retrieved successfully',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  getActiveScheduleFile: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get the active schedule file' }),
      ApiResponse({
        status: 200,
        description: 'Active schedule file retrieved',
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
};
