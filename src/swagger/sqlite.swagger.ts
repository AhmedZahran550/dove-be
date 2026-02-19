import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import {
  SqliteConnectionResponseDto,
  UpdateSqliteConnectionDto,
} from '../modules/schedule/dto/sync-agent.dto';

export const SqliteSwagger = {
  getSqliteConnections: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get SQLite databases connected via local sync agent' }),
      ApiResponse({
        status: 200,
        description: 'SQLite connections retrieved successfully',
        type: SqliteConnectionResponseDto,
      }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      ApiResponse({
        status: 403,
        description: 'Forbidden - Admin access required',
      }),
      ApiBearerAuth('JWT-auth'),
    ),
  updateSqliteConnection: () =>
    applyDecorators(
      ApiOperation({ summary: 'Update SQLite connection configuration' }),
      ApiBody({ type: UpdateSqliteConnectionDto }),
      ApiResponse({
        status: 200,
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
};
