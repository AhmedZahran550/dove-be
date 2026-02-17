import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DowntimeReasonsService } from './downtime-reasons.service';
import { DowntimeReasonsController } from './downtime-reasons.controller';
import { DowntimeReason } from '@/database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([DowntimeReason])],
  controllers: [DowntimeReasonsController],
  providers: [DowntimeReasonsService],
  exports: [DowntimeReasonsService],
})
export class DowntimeReasonsModule {}
