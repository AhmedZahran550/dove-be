import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { WorkOrder } from './work-order.entity';

@Entity('work_order_statuses')
@Unique(['companyId', 'departmentId', 'code'])
@Index(['companyId'])
@Index(['departmentId'])
@Index(['isActive'])
export class WorkOrderStatus extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'uuid', nullable: true })
  departmentId?: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon?: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'boolean', default: false })
  isTerminal: boolean;

  @Column({ type: 'boolean', default: true })
  canEditWo: boolean;

  @Column({ type: 'boolean', default: false })
  requiresApproval: boolean;

  @Column({ type: 'integer', default: 0 })
  displayOrder: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => Company, (company) => company.workOrderStatuses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @OneToMany(() => WorkOrder, (workOrder) => workOrder.status)
  workOrders?: WorkOrder[];
}
