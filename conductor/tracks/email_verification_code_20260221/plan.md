# Implementation Plan: Code-Based Email Verification

This plan implements a 6-character alphanumeric code verification system for email verification, replacing the current JWT-link-based system.

## Phase 1: Database Foundation
- [ ] Task: Create `VerificationCode` entity in `src/database/entities/verification-code.entity.ts`.
    - Include `userId`, `code`, `type`, `expiresAt`, `isUsed`.
- [ ] Task: Update `src/database/entities/index.ts` to export the new entity.
- [ ] Task: Generate and run a migration to add the `verification_codes` table.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Database Foundation' (Protocol in workflow.md)

## Phase 2: Logic and Service Layer
- [ ] Task: Create `VerificationCodeService` in `src/modules/auth/verification-code.service.ts`.
- [ ] Task: Implement random 6-char alphanumeric code generation.
- [ ] Task: Implement `createCode` logic (ensures only one active code per type/user).
- [ ] Task: Implement `verifyCode` logic (checks expiration and matching).
- [ ] Task: Implement rate limiting (60s cooldown).
- [ ] Task: TDD - Write unit tests for `VerificationCodeService`.
- [ ] Task: TDD - Implement service to pass tests.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Logic and Service Layer' (Protocol in workflow.md)

## Phase 3: Email Communication
- [ ] Task: Update `EmailService.sendEmailVerification` to accept `code` instead of `token`.
- [ ] Task: Update `src/templates/email-verification.hbs` to show the code and remove the old link button.
- [ ] Task: TDD - Write unit tests for `EmailService` verification changes.
- [ ] Task: TDD - Implement changes to pass tests.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Email Communication' (Protocol in workflow.md)

## Phase 4: Auth Flow Integration
- [ ] Task: Update `AuthService.register` and `AuthService.sendVerificationEmail` to use the new code system.
- [ ] Task: Update `AuthService.verifyEmail` to use the new code-based logic.
- [ ] Task: Implement `AuthService.resendVerificationEmail` with rate limit.
- [ ] Task: Update `VerifyEmailDto` in `src/modules/auth/dto/auth.dto.ts`.
- [ ] Task: Update `AuthController` endpoints and add `POST /auth/email/resend`.
- [ ] Task: TDD - Write E2E integration tests for the full verification flow.
- [ ] Task: TDD - Implement auth changes to pass tests.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Auth Flow Integration' (Protocol in workflow.md)
