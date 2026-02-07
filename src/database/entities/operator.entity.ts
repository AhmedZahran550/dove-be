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
  companyId: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  defaultLocationId: string;

  @Column({ type: 'varchar', length: 255 })
  operatorId: string;

  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  position: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  employeeType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  shift: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'date', nullable: true })
  hireDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  companyEmployeeId: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @Column({ type: 'text', nullable: true })
  passwordHash: string;

  @Column({ type: 'boolean', default: true })
  mustChangePassword: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date;

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
