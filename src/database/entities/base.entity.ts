import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';

/**
 * Base entity with common fields for all entities
 * - id: UUID primary key
 * - created_at: timestamp when record was created
 * - updated_at: timestamp when record was last updated
 * - deleted_at: soft delete timestamp (null if not deleted)
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deleted_at?: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  created_by?: string;
}
