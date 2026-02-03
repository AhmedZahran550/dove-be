import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrder } from '../../database/entities';
import { Location } from '../../database/entities';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrdersController } from './work-orders.controller';
import {
  ConditionalStatusRule,
  WorkOrderStatus,
} from '../../database/entities';
import { ConditionalStatusRulesController } from './conditional-status-rules.controller';
import { ConditionalStatusRulesService } from './conditional-status-rules.service';
import { WorkOrderStatusesController } from './work-order-statuses.controller';
import { WorkOrderStatusesService } from './work-order-statuses.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkOrder,
      Location,
      ConditionalStatusRule,
      WorkOrderStatus,
    ]),
  ],
  controllers: [
    WorkOrdersController,
    ConditionalStatusRulesController,
    WorkOrderStatusesController,
  ],
  providers: [
    WorkOrdersService,
    ConditionalStatusRulesService,
    WorkOrderStatusesService,
  ],
  exports: [WorkOrdersService],
})
export class WorkOrdersModule {}
