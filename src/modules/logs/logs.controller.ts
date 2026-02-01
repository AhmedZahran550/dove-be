import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LogsSwagger } from '@/swagger/logs.swagger';
import { Paginate, QueryOptions } from '../../common/query-options';
import { LogsService } from './logs.service';

@ApiTags('logs')
@Controller('logs')
@ApiBearerAuth('JWT-auth')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @LogsSwagger.findAll()
  findAll(@Paginate() query: QueryOptions) {
    return this.logsService.findAll(query);
  }

  @Get(':id')
  @LogsSwagger.findOne()
  findOne(@Param('id') id: string) {
    return this.logsService.findById(id);
  }
}
