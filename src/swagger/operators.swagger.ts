import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

import { CreateOperatorDto } from '../modules/operators/dto/create-operator.dto';
import { UpdateOperatorDto } from '../modules/operators/dto/update-operator.dto';

export const OperatorsSwagger = {
  findAll: () =>
    applyDecorators(
      ApiOperation({
        summary: 'List all operators',
        description: 'Get paginated list of all operators',
      }),
      ApiResponse({
        status: 200,
        description: 'Operators retrieved successfully',
      }),
    ),
  findOne: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get operator details' }),
      ApiParam({ name: 'id', description: 'Operator UUID' }),
      ApiResponse({ status: 200, description: 'Operator retrieved' }),
      ApiResponse({ status: 404, description: 'Operator not found' }),
    ),
  create: () =>
    applyDecorators(
      ApiOperation({ summary: 'Create new operator' }),
      ApiBody({ type: CreateOperatorDto }),
      ApiResponse({ status: 201, description: 'Created' }),
      ApiResponse({ status: 400, description: 'Invalid data' }),
    ),
  update: () =>
    applyDecorators(
      ApiOperation({ summary: 'Update operator' }),
      ApiParam({ name: 'id', description: 'Operator UUID' }),
      ApiBody({ type: UpdateOperatorDto }),
      ApiResponse({ status: 200, description: 'Updated' }),
      ApiResponse({ status: 404, description: 'Not found' }),
    ),
  remove: () =>
    applyDecorators(
      ApiOperation({ summary: 'Delete operator' }),
      ApiParam({ name: 'id', description: 'Operator UUID' }),
      ApiResponse({ status: 200, description: 'Deleted' }),
      ApiResponse({ status: 404, description: 'Not found' }),
    ),
};
