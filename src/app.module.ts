import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { LocationsModule } from './modules/locations/locations.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { TimeSegmentsModule } from './modules/time-segments/time-segments.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { SettingsModule } from './modules/settings/settings.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { DatabaseModule } from './database/database.module';
import { schemaValidator } from './config/schema-validator';
import { baseConfig } from './config/base.config';
import databaseConfig from './config/database.config';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
