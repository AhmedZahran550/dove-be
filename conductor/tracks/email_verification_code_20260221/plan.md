# Implementation Plan: Code-Based Email Verification

This plan implements a 6-character alphanumeric code verification system for email verification, replacing the current JWT-link-based system.

## Phase 1: Database Foundation
- [x] Task: Create `VerificationCode` entity in `src/database/entities/verification-code.entity.ts`.
    - Include `userId`, `code`, `type`, `expiresAt`, `isUsed`.
- [x] Task: Update `src/database/entities/index.ts` to export the new entity.
- [x] Task: Generate and run a migration to add the `verification_codes` table.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Database Foundation' (Protocol in workflow.md)

## Phase 2: Logic and Service Layer
- [x] Task: Create `VerificationCodeService` in `src/modules/auth/verification-code.service.ts`.
- [x] Task: Implement random 6-char alphanumeric code generation.
- [x] Task: Implement `createCode` logic (ensures only one active code per type/user).
- [x] Task: Implement `verifyCode` logic (checks expiration and matching).
- [x] Task: Implement rate limiting (60s cooldown).
- [x] Task: TDD - Write unit tests for `VerificationCodeService`.
- [x] Task: TDD - Implement service to pass tests.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Logic and Service Layer' (Protocol in workflow.md)

## Phase 3: Email Communication
- [x] Task: Update `EmailService.sendEmailVerification` to accept `code` instead of `token`.
- [x] Task: Update `src/templates/email-verification.hbs` to show the code and remove the old link button.
- [x] Task: TDD - Write unit tests for `EmailService` verification changes.
- [x] Task: TDD - Implement changes to pass tests.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Email Communication' (Protocol in workflow.md)

## Phase 4: Auth Flow Integration
- [x] Task: Update `AuthService.register` and `AuthService.sendVerificationEmail` to use the new code system.
- [x] Task: Update `AuthService.verifyEmail` to use the new code-based logic.
- [x] Task: Implement `AuthService.resendVerificationEmail` with rate limit.
- [x] Task: Update `VerifyEmailDto` in `src/modules/auth/dto/auth.dto.ts`.
- [x] Task: Update `AuthController` endpoints and add `POST /auth/email/resend`.
- [x] Task: TDD - Write E2E integration tests for the full verification flow.
- [x] Task: TDD - Implement auth changes to pass tests.
- [x] Task: Conductor - User Manual Verification 'Phase 4: Auth Flow Integration' (Protocol in workflow.md)

## Phase: Review Fixes
- [x] Task: Apply review suggestions 29e4c68
