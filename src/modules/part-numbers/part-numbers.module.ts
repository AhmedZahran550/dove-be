import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartNumber } from '../../database/entities';
import { PartNumbersService } from './part-numbers.service';
import { PartNumbersController } from './part-numbers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PartNumber])],
  controllers: [PartNumbersController],
  providers: [PartNumbersService],
  exports: [PartNumbersService],
})
export class PartNumbersModule {}
