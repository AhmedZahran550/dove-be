import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ConnectorResponseDto } from '../modules/schedule/dto/sync-agent.dto';

export const ConnectorsSwagger = {
  getAvailableConnectors: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get available data connectors' }),
      ApiResponse({
        status: 200,
        description: 'Connectors retrieved successfully',
        type: ConnectorResponseDto,
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({
        status: 403,
        description: 'Forbidden - Admin access required',
      }),
      ApiBearerAuth('JWT-auth'),
    ),
};
