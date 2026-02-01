import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

import { CreateEquipmentDto } from '../modules/equipment/dto/create-equipment.dto';
import { UpdateEquipmentDto } from '../modules/equipment/dto/update-equipment.dto';

export const EquipmentSwagger = {
  findAll: () =>
    applyDecorators(
      ApiOperation({
        summary: 'List all equipment',
        description: 'Get paginated list of all equipment',
      }),
      ApiResponse({
        status: 200,
        description: 'Equipment retrieved successfully',
      }),
    ),
  findOne: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get equipment details' }),
      ApiParam({ name: 'id', description: 'Equipment UUID' }),
      ApiResponse({ status: 200, description: 'Equipment retrieved' }),
      ApiResponse({ status: 404, description: 'Equipment not found' }),
    ),
  create: () =>
    applyDecorators(
      ApiOperation({ summary: 'Create new equipment' }),
      ApiBody({ type: CreateEquipmentDto }),
      ApiResponse({ status: 201, description: 'Created' }),
      ApiResponse({ status: 400, description: 'Invalid data' }),
    ),
  update: () =>
    applyDecorators(
      ApiOperation({ summary: 'Update equipment' }),
      ApiParam({ name: 'id', description: 'Equipment UUID' }),
      ApiBody({ type: UpdateEquipmentDto }),
      ApiResponse({ status: 200, description: 'Updated' }),
      ApiResponse({ status: 404, description: 'Not found' }),
    ),
  remove: () =>
    applyDecorators(
      ApiOperation({ summary: 'Delete equipment' }),
      ApiParam({ name: 'id', description: 'Equipment UUID' }),
      ApiResponse({ status: 200, description: 'Deleted' }),
      ApiResponse({ status: 404, description: 'Not found' }),
    ),
};
