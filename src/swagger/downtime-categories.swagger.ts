import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { CreateDowntimeCategoryDto } from '../modules/downtime-categories/dto/create-downtime-category.dto';
import { UpdateDowntimeCategoryDto } from '../modules/downtime-categories/dto/update-downtime-category.dto';
import { DowntimeCategory } from '../database/entities';

export const DowntimeCategoriesSwagger = {
  create: () =>
    applyDecorators(
      ApiOperation({ summary: 'Create a new downtime category' }),
      ApiBody({ type: CreateDowntimeCategoryDto }),
      ApiResponse({
        status: 201,
        description: 'The downtime category has been successfully created.',
        type: DowntimeCategory,
      }),
    ),

  findAll: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get all downtime categories' }),
      ApiResponse({
        status: 200,
        description: 'Return all downtime categories.',
        type: [DowntimeCategory],
      }),
    ),

  findOne: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get a downtime category by id' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({
        status: 200,
        description: 'Return the downtime category.',
        type: DowntimeCategory,
      }),
      ApiResponse({ status: 404, description: 'Downtime category not found.' }),
    ),

  update: () =>
    applyDecorators(
      ApiOperation({ summary: 'Update a downtime category' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiBody({ type: UpdateDowntimeCategoryDto }),
      ApiResponse({
        status: 200,
        description: 'The downtime category has been successfully updated.',
        type: DowntimeCategory,
      }),
      ApiResponse({ status: 404, description: 'Downtime category not found.' }),
    ),

  remove: () =>
    applyDecorators(
      ApiOperation({ summary: 'Delete a downtime category' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({
        status: 200,
        description: 'The downtime category has been successfully deleted.',
      }),
      ApiResponse({ status: 404, description: 'Downtime category not found.' }),
    ),
};
