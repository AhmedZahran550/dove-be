import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreatePlanDto, UpdatePlanDto } from '@/modules/plans/dto';

export const PlansSwagger = {
  create: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Create a new plan',
        description: 'Create a new subscription plan (Admin only)',
      }),
      ApiBody({ type: CreatePlanDto }),
      ApiResponse({ status: 201, description: 'Plan created successfully' }),
      ApiResponse({ status: 400, description: 'Invalid data' }),
      ApiResponse({ status: 409, description: 'Plan code already exists' }),
    ),

  findAll: () =>
    applyDecorators(
      ApiOperation({
        summary: 'List all active plans',
        description: 'Get all active subscription plans',
      }),
      ApiResponse({ status: 200, description: 'Plans retrieved successfully' }),
    ),

  findOne: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get plan details',
        description: 'Get a specific plan by ID',
      }),
      ApiParam({ name: 'id', description: 'Plan UUID' }),
      ApiResponse({ status: 200, description: 'Plan retrieved' }),
      ApiResponse({ status: 404, description: 'Plan not found' }),
    ),

  update: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Update plan',
        description: 'Update an existing plan (Admin only)',
      }),
      ApiParam({ name: 'id', description: 'Plan UUID' }),
      ApiBody({ type: UpdatePlanDto }),
      ApiResponse({ status: 200, description: 'Plan updated' }),
      ApiResponse({ status: 404, description: 'Plan not found' }),
      ApiResponse({ status: 409, description: 'Plan code already exists' }),
    ),

  remove: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Delete plan',
        description: 'Soft delete a plan (Super Admin only)',
      }),
      ApiParam({ name: 'id', description: 'Plan UUID' }),
      ApiResponse({ status: 200, description: 'Plan deleted' }),
      ApiResponse({ status: 404, description: 'Plan not found' }),
    ),
};
