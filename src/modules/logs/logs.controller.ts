import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Paginate, QueryOptions } from '../../common/query-options';
import { LogsService } from './logs.service';

@ApiTags('logs')
@Controller('logs')
@ApiBearerAuth('JWT-auth')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all logs with pagination' })
  @ApiResponse({ status: 200, description: 'Logs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Paginate() query: QueryOptions) {
    return this.logsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a log by ID' })
  @ApiParam({ name: 'id', description: 'Log ID' })
  @ApiResponse({ status: 200, description: 'Log found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Log not found' })
  findOne(@Param('id') id: string) {
    return this.logsService.findById(id);
  }
}
