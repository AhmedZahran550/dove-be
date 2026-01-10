import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { WorkOrder } from './work-order.entity';
import { UserProfile } from './user-profile.entity';

@Entity('work_order_operators')
@Unique(['workOrderId', 'operatorId'])
@Index(['companyId'])
@Index(['workOrderId'])
@Index(['operatorId'])
@Index(['workOrderId', 'isPrimary'])
export class WorkOrderOperator extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid' })
  workOrderId: string;

  @Column({ type: 'uuid' })
  operatorId: string;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  // Relations
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @ManyToOne(() => WorkOrder, (wo) => wo.workOrderOperators, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workOrderId' })
  workOrder?: WorkOrder;

  @ManyToOne(() => UserProfile, (user) => user.workOrderOperators, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'operatorId' })
  operator?: UserProfile;
}
