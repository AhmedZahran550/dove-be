import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessStep } from '../../database/entities/process-step.entity';
import { SharedModule } from '@/common/shared.module';
import { ProcessStepsController } from './process-steps.controller';
import { ProcessStepsService } from './process-steps.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProcessStep]), SharedModule],
  controllers: [ProcessStepsController],
  providers: [ProcessStepsService],
  exports: [ProcessStepsService],
})
export class ProcessStepsModule {}
