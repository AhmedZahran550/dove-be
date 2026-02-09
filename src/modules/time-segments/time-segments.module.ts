import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeSegment } from '../../database/entities';
import { TimeSegmentsService } from './time-segments.service';
import { TimeSegmentsController } from './time-segments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TimeSegment])],
  controllers: [TimeSegmentsController],
  providers: [TimeSegmentsService],
  exports: [TimeSegmentsService],
})
export class TimeSegmentsModule {}
