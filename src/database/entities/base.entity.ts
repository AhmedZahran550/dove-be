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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy?: string;
}
