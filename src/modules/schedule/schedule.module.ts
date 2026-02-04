import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleData } from '../../database/entities';
import { ScheduleFile } from '../../database/entities';
import { CompanyColumnMapping } from '../../database/entities';
import { Department } from '../../database/entities/department.entity';
import { SystemConfiguration } from '../../database/entities/system-configuration.entity';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScheduleData,
      ScheduleFile,
      CompanyColumnMapping,
      Department,
      SystemConfiguration,
    ]),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
