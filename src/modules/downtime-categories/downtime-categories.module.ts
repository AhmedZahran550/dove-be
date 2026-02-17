import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DowntimeCategoriesService } from './downtime-categories.service';
import { DowntimeCategoriesController } from './downtime-categories.controller';
import { DowntimeCategory } from '@/database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([DowntimeCategory])],
  controllers: [DowntimeCategoriesController],
  providers: [DowntimeCategoriesService],
  exports: [DowntimeCategoriesService],
})
export class DowntimeCategoriesModule {}
