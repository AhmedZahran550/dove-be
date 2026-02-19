import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleData } from '../../database/entities';
import { ScheduleFile } from '../../database/entities';
import { CompanyColumnMapping } from '../../database/entities';
import { Department } from '../../database/entities/department.entity';
import { SystemConfiguration } from '../../database/entities/system-configuration.entity';
import { TimeSegment } from '../../database/entities/time-segment.entity';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { ConnectorsController } from './connectors.controller';
import { SqliteConnectionsController } from './sqlite-connections.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScheduleData,
      ScheduleFile,
      CompanyColumnMapping,
      Department,
      SystemConfiguration,
      TimeSegment,
    ]),
  ],
  controllers: [
    ScheduleController,
    ConnectorsController,
    SqliteConnectionsController,
  ],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
