import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipment } from '../../database/entities';
import { EquipmentController } from './equipment.controller';
import { EquipmentService } from './equipment.service';

import { SharedModule } from '@/common/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Equipment]), SharedModule],
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
