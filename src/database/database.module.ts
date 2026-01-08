import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  User,
  Company,
  Location,
  WorkOrder,
  Department,
  DepartmentSetting,
  TimeSegment,
  ScheduleData,
  ScheduleFile,
  RejectionCategory,
  RejectionReason,
  Invitation,
} from './entities';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        timezone: 'z',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      Company,
      Location,
      WorkOrder,
      Department,
      DepartmentSetting,
      TimeSegment,
      ScheduleData,
      ScheduleFile,
      RejectionCategory,
      RejectionReason,
      Invitation,
    ]),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
