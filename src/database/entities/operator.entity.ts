import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { Location } from './location.entity';
import { UserProfile } from './user-profile.entity';
// Import OperatorDepartment AFTER it is defined or with forward ref if needed, but standard import should work if file exists.
// Re-adding import clearly.
import { OperatorDepartment } from './operator-department.entity';

@Entity('operators')
export class Operator extends BaseEntity {
  @Column({ type: 'uuid' })
  company_id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  default_location_id: string;

  @Column({ type: 'varchar', length: 255 })
  operator_id: string;

  @Column({ type: 'varchar', length: 255 })
  first_name: string;

  @Column({ type: 'varchar', length: 255 })
  last_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  position: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  employee_type: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  shift: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'date', nullable: true })
  hire_date: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  company_employee_id: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @Column({ type: 'text', nullable: true })
  password_hash: string;

  @Column({ type: 'boolean', default: true })
  must_change_password: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  last_login_at: Date;

  // Relations
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => UserProfile) // Assuming User/UserProfile relationship
  @JoinColumn({ name: 'user_id' })
  user: UserProfile;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'default_location_id' })
  defaultLocation: Location;

  @OneToMany(() => OperatorDepartment, (opDep) => opDep.operator)
  operatorDepartments: OperatorDepartment[];
}
