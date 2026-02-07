import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkOrderStatusResponseDto } from '../modules/work-orders/dto/statuses/work-order-status-response.dto';

export const WorkOrderStatusesSwagger = {
  findAll: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Get all work order statuses',
        description:
          'Returns company-specific custom statuses merged with default system statuses. ' +
          'Default statuses (Waiting, Running, Ongoing, Completed) are automatically provided. ' +
          'Custom statuses with the same code override defaults.',
      }),
      ApiResponse({
        status: 200,
        description: 'Statuses retrieved successfully',
        type: [WorkOrderStatusResponseDto],
        schema: {
          example: [
            {
              id: '00000000-0000-4000-8000-000000000001',
              name: 'waiting',
              code: 'WAITING',
              description: 'Work order is scheduled but not yet started',
              color: '#6B7280',
              fontColor: '#FFFFFF',
              borderColor: null,
              fontWeight: 'normal',
              isFlashing: false,
              isDefault: false,
              statusType: 'default',
            },
            {
              id: '5a38790b-b21a-47db-b74e-126577b4546b',
              name: 'custom_status',
              code: 'CUSTOM',
              description: 'Company-specific custom status',
              color: '#EF4444',
              fontColor: '#FFFFFF',
              borderColor: '#DC2626',
              fontWeight: 'bold',
              isFlashing: true,
              isDefault: false,
              statusType: 'custom',
            },
          ],
        },
      }),
      ApiResponse({
        status: 401,
        description: 'Unauthorized - Authentication token missing or invalid',
      }),
      ApiResponse({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
      }),
      ApiBearerAuth('JWT-auth'),
    ),
};
