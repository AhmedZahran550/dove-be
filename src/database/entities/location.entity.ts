import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { WorkOrder } from './work-order.entity';

@Entity('locations')
@Unique(['companyId', 'code'])
@Index(['companyId'])
export class Location extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  addressLine1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  addressLine2: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  stateProvince: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode: string;

  // location_type CHECK ... default manufacturing
  @Column({ type: 'varchar', default: 'manufacturing' })
  locationType: string;

  @Column({ type: 'varchar', nullable: true })
  managerName: string;

  @Column({ type: 'varchar', nullable: true })
  managerEmail: string;

  @Column({ type: 'jsonb', nullable: true })
  operatingHours: Record<string, any>;

  @Column({ type: 'int', nullable: true })
  totalAreaSqft: number;

  @Column({ type: 'int', default: 1 })
  productionLines: number;

  @Column({ type: 'int', nullable: true })
  maxOperators: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => Company, (company) => company.locations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ type: 'uuid' })
  companyId: string;

  @OneToMany(() => WorkOrder, (workOrder) => workOrder.location)
  workOrders?: WorkOrder[];
}
