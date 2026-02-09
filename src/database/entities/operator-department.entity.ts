import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Operator } from './operator.entity';
import { Department } from './department.entity';

@Entity('operator_departments')
export class OperatorDepartment extends BaseEntity {
  @Column({ type: 'uuid' })
  operatorId: string;

  @Column({ type: 'uuid' })
  departmentId: string;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;

  // Relations
  @ManyToOne(() => Operator, (operator) => operator.operatorDepartments)
  @JoinColumn({ name: 'operator_id' })
  operator: Operator;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;
}
