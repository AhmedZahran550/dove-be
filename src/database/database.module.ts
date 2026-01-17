import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
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
  UserProfile,
  Plan,
  Subscription,
  Transaction,
  WebhookEvent,
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
      UserProfile,
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
      Plan,
      Subscription,
      Transaction,
      WebhookEvent,
    ]),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
