import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
// Assuming UserProfile or AuthUser entity if needed, but schema references auth.users which might be external or handled via simple string/relation if User entity existed.
// Given previous prompts, I will use string/uuid for user_id if User entity is not clearly defined in current context, or try to import UserProfile if that's the main user entity.
// Schema says REFERENCES auth.users(id), which is usually Supabase/Firebase auth or similar distinct schema.
// I will treat it as a column for now unless User entity is available in "src/database/entities" (it is not in the list I saw earlier, only user-profile.entity.ts).
import { UserProfile } from './user-profile.entity';

@Entity('email_verification_tokens')
export class EmailVerificationToken extends BaseEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'text', unique: true })
  token: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'text', nullable: true })
  fullName: string;

  @Column({ type: 'text', nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  organizationName: string;

  // Relations
  // Note: user_id references auth.users(id) in schema. I will map it to UserProfile if possible or just keep it as ID.
  // Given I see no 'User' entity in the file list, only 'UserProfile', I will leave it as an ID column for now to be safe, or assume strict FK isn't enforceable by TypeORM across schemas readily without the entity.
  // Actually, let's just make it a Column.
}
