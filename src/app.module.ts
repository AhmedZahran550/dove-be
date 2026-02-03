import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { LocationsModule } from './modules/locations/locations.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { TimeSegmentsModule } from './modules/time-segments/time-segments.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { SettingsModule } from './modules/settings/settings.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { PlansModule } from './modules/plans/plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { LogsModule } from './modules/logs/logs.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { OperatorsModule } from './modules/operators/operators.module';
import { PartNumbersModule } from './modules/part-numbers/part-numbers.module';
import { DatabaseModule } from './database/database.module';

import { schemaValidator } from './config/schema-validator';
import { baseConfig } from './config/base.config';
import databaseConfig from './config/database.config';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { MetadataInterceptor } from './common/interceptors/metadata.interceptor';
import { PostAuthorizeInterceptor } from './common/interceptors/post-authorize.interceptor';
import { DBExceptionFilter } from './common/filters/db-exception.filter';
import { GeneralExceptionFilter } from './common/filters/general-exception.filter';
import { LoggingInterceptor } from './common/interceptors/log.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerMiddleware } from './common/logger.middleware';

const envFolderPath = `${__dirname}/config/env`;
const envFilePath = [
  `${envFolderPath}/${process.env.NODE_ENV ?? 'development'}.env`,
  `${envFolderPath}/default.env`, // If a variable is found in multiple files, the first one takes precedence.
];

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: schemaValidator,
      envFilePath,
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [baseConfig, databaseConfig],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),

    // Database module (with CustomNamingStrategy and all entities)
    DatabaseModule,

    // Cache module
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes default
    }),
    AuthModule,
    UsersModule,
    CompaniesModule,
    LocationsModule,
    WorkOrdersModule,
    DepartmentsModule,
    TimeSegmentsModule,
    ScheduleModule,
    SettingsModule,
    InvitationsModule,
    PlansModule,
    SubscriptionsModule,
    LogsModule,
    EquipmentModule,
    OperatorsModule,
    PartNumbersModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GeneralExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DBExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PostAuthorizeInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetadataInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {
    // if (this.configService.get<string>('NODE_ENV') === 'production')
    if (true) {
      consumer
        .apply(LoggerMiddleware)
        .exclude(
          {
            path: 'api/logs',
            method: RequestMethod.POST,
          },
          {
            path: 'api/logs',
            method: RequestMethod.GET,
          },
          {
            path: 'api/logs',
            method: RequestMethod.DELETE,
          },
        )
        .forRoutes('*');
    }
  }
}
