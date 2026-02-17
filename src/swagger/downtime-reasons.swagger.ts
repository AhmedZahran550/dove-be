import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { CreateDowntimeReasonDto } from '../modules/downtime-reasons/dto/create-downtime-reason.dto';
import { UpdateDowntimeReasonDto } from '../modules/downtime-reasons/dto/update-downtime-reason.dto';
import { DowntimeReason } from '../database/entities';

export const DowntimeReasonsSwagger = {
  create: () =>
    applyDecorators(
      ApiOperation({ summary: 'Create a new downtime reason' }),
      ApiBody({ type: CreateDowntimeReasonDto }),
      ApiResponse({
        status: 201,
        description: 'The downtime reason has been successfully created.',
        type: DowntimeReason,
      }),
    ),

  findAll: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get all downtime reasons' }),
      ApiResponse({
        status: 200,
        description: 'Return all downtime reasons.',
        type: [DowntimeReason],
      }),
    ),

  findOne: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get a downtime reason by id' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({
        status: 200,
        description: 'Return the downtime reason.',
        type: DowntimeReason,
      }),
      ApiResponse({ status: 404, description: 'Downtime reason not found.' }),
    ),

  update: () =>
    applyDecorators(
      ApiOperation({ summary: 'Update a downtime reason' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiBody({ type: UpdateDowntimeReasonDto }),
      ApiResponse({
        status: 200,
        description: 'The downtime reason has been successfully updated.',
        type: DowntimeReason,
      }),
      ApiResponse({ status: 404, description: 'Downtime reason not found.' }),
    ),

  remove: () =>
    applyDecorators(
      ApiOperation({ summary: 'Delete a downtime reason' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({
        status: 200,
        description: 'The downtime reason has been successfully deleted.',
      }),
      ApiResponse({ status: 404, description: 'Downtime reason not found.' }),
    ),
};
