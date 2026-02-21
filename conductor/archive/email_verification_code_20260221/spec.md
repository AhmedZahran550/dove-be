# Specification: Code-Based Email Verification (v2)

## Overview
Replace the current JWT link-based email verification with a 6-character alphanumeric code verification system. A dedicated `VerificationCode` table will be used to store and track all verification requests, facilitating auditing and rate limiting.

## Functional Requirements

### 1. Database Schema Updates
- Create a new entity `VerificationCode`:
  - `id`: UUID (Primary Key)
  - `userId`: UUID (Foreign Key to User)
  - `code`: string (6-character alphanumeric)
  - `type`: enum (e.g., `EMAIL_VERIFICATION`)
  - `expiresAt`: timestamp (10 minutes from generation)
  - `isUsed`: boolean (default: `false`)
  - `createdAt`: timestamp
  - `updatedAt`: timestamp

### 2. Code Generation and Storage
- When a user registers or requests a new code:
  - Generate a random 6-character alphanumeric code.
  - Create a new entry in the `VerificationCode` table.
  - Deactivate/Mark as used any previous active codes for the same user and type.

### 3. Email Communication
- Update the email verification template to display the 6-character code prominently.
- Update `EmailService.sendEmailVerification` to accept and send the code.

### 4. Verification Endpoint
- Modify `POST /auth/email/verify` to accept:
  - `email`: The user's email address.
  - `code`: The 6-character alphanumeric code.
- Validation Logic:
  - Find the latest unused and non-expired code for the user.
  - If valid: Mark code as `isUsed = true`, mark user as `isVerified = true`. Return auth tokens.
  - If invalid or expired: Return `400 Bad Request`.

### 5. Resend Verification Code & Rate Limiting
- Use the `VerificationCode` table to enforce a 60-second cooldown between requests.
- Generate a new code and send email upon request.

### 6. Security
- Disable existing link-based verification.
- Ensure only the latest code is valid.

## Acceptance Criteria
- [ ] New `VerificationCode` table is created and properly migrated.
- [ ] User receives an email with a 6-character code upon registration.
- [ ] Verification works using the new table.
- [ ] Rate limiting (60s) is enforced by checking the database records.
- [ ] Link-based verification no longer works.
