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
import { ScheduleDepartmentSummaryDto } from '../modules/schedule/dto/schedule-summary.dto';
import {
  ScheduleColumnsResponseDto,
  ScheduleConfigResponseDto,
} from '../modules/schedule/dto/schedule-config.dto';
import {
  CreateColumnMappingDto,
  ColumnMappingResponseDto,
  UpdateColumnMappingDto,
} from '../modules/schedule/dto/schedule-mapping.dto';

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
  getDepartmentSummary: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get production summary per department' }),
      ApiQuery({ name: 'release_date_from', required: false, type: String }),
      ApiQuery({ name: 'release_date_to', required: false, type: String }),
      ApiQuery({ name: 'departments', required: false, type: String }),
      ApiResponse({
        status: 200,
        description: 'Department summary retrieved',
        type: [ScheduleDepartmentSummaryDto],
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  getScheduleColumns: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get available schedule columns' }),
      ApiResponse({
        status: 200,
        description: 'Columns configuration retrieved',
        schema: {
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  excelName: { type: 'string' },
                  normalizedName: { type: 'string' },
                  sampleValue: { type: 'string' },
                },
              },
            },
          },
        },
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  getColumnMappings: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get column mappings' }),
      ApiResponse({
        status: 200,
        description: 'Column mappings retrieved',
        schema: {
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ColumnMappingResponseDto' },
            },
          },
        },
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  createColumnMapping: () =>
    applyDecorators(
      ApiOperation({ summary: 'Create a new column mapping' }),
      ApiBody({ type: CreateColumnMappingDto }),
      ApiResponse({
        status: 201,
        description: 'Column mapping created',
        schema: {
          properties: {
            data: { $ref: '#/components/schemas/ColumnMappingResponseDto' },
          },
        },
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  updateColumnMapping: () =>
    applyDecorators(
      ApiOperation({ summary: 'Update a column mapping' }),
      ApiParam({ name: 'id', description: 'Mapping ID' }),
      ApiBody({ type: UpdateColumnMappingDto }),
      ApiResponse({
        status: 200,
        description: 'Column mapping updated',
        schema: {
          properties: {
            data: { $ref: '#/components/schemas/ColumnMappingResponseDto' },
          },
        },
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  getScheduleSyncConfig: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get schedule sync status and configuration' }),
      ApiResponse({
        status: 200,
        description: 'Sync configuration retrieved',
        type: ScheduleConfigResponseDto,
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  triggerScheduleSync: () =>
    applyDecorators(
      ApiOperation({ summary: 'Trigger manual schedule sync' }),
      ApiResponse({
        status: 200,
        description: 'Sync started successfully',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiBearerAuth('JWT-auth'),
    ),
  getTimeSegments: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get time segments for a schedule' }),
      ApiParam({ name: 'id', description: 'Schedule data ID' }),
      ApiResponse({
        status: 200,
        description: 'Time segments retrieved successfully',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  workOrderId: { type: 'string', format: 'uuid' },
                  startTime: { type: 'string', format: 'date-time' },
                  endTime: {
                    type: 'string',
                    format: 'date-time',
                    nullable: true,
                  },
                  qtyCompleted: { type: 'number' },
                  downTimeMinutes: { type: 'number' },
                  notes: { type: 'string', nullable: true },
                  step: { type: 'string', nullable: true },
                  operatorId: {
                    type: 'string',
                    format: 'uuid',
                    nullable: true,
                  },
                  operatorName: { type: 'string', nullable: true },
                  machineName: { type: 'string', nullable: true },
                  equipmentId: {
                    type: 'string',
                    format: 'uuid',
                    nullable: true,
                  },
                },
              },
            },
          },
        },
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({ status: 404, description: 'Schedule data not found' }),
      ApiBearerAuth('JWT-auth'),
    ),
};
