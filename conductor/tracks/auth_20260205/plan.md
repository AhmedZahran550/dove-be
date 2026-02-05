# Track Plan: Implement the core user authentication flow

## Phase 1: Setup and Basic User Registration
- [ ] Task: Conductor - User Manual Verification 'Setup and Basic User Registration' (Protocol in workflow.md)
    - [ ] Write Tests: Create unit tests for user registration validation and password hashing.
    - [ ] Implement Feature: Create `AuthModule` and `AuthService`.
    - [ ] Implement Feature: Define `User` entity and `UserDto` for registration.
    - [ ] Implement Feature: Add registration endpoint (`/auth/register`).
    - [ ] Implement Feature: Integrate Argon2 for password hashing.
    - [ ] Implement Feature: Implement basic user creation in the database.
    - [ ] Write Tests: Create integration tests for the registration endpoint.

## Phase 2: User Login and JWT Generation
- [ ] Task: Conductor - User Manual Verification 'User Login and JWT Generation' (Protocol in workflow.md)
    - [ ] Write Tests: Create unit tests for login validation and password comparison.
    - [ ] Implement Feature: Add login endpoint (`/auth/login`).
    - [ ] Implement Feature: Integrate Passport.js Local Strategy for username/password authentication.
    - [ ] Implement Feature: Generate JWT upon successful login.
    - [ ] Implement Feature: Return JWT to the client.
    - [ ] Write Tests: Create integration tests for the login endpoint.

## Phase 3: JWT-based Session Management
- [ ] Task: Conductor - User Manual Verification 'JWT-based Session Management' (Protocol in workflow.md)
    - [ ] Write Tests: Create unit tests for JWT validation.
    - [ ] Implement Feature: Implement Passport.js JWT Strategy for protected routes.
    - [ ] Implement Feature: Create a guard to protect routes using JWT.
    - [ ] Implement Feature: Add a sample protected endpoint to test JWT authentication.
    - [ ] Implement Feature: Configure JWT expiration.
    - [ ] Write Tests: Create integration tests for protected endpoints.

## Phase 4: Password Reset Functionality
- [ ] Task: Conductor - User Manual Verification 'Password Reset Functionality' (Protocol in workflow.md)
    - [ ] Write Tests: Create unit tests for password reset token generation and validation.
    - [ ] Implement Feature: Add password reset request endpoint (`/auth/forgot-password`).
    - [ ] Implement Feature: Generate secure, time-limited password reset token.
    - [ ] Implement Feature: Send password reset email (using Resend/Nodemailer).
    - [ ] Implement Feature: Add password reset confirmation endpoint (`/auth/reset-password`).
    - [ ] Implement Feature: Allow users to set new password with valid token.
    - [ ] Write Tests: Create integration tests for password reset flow.

## Phase 5: User Roles and Authorization
- [ ] Task: Conductor - User Manual Verification 'User Roles and Authorization' (Protocol in workflow.md)
    - [ ] Write Tests: Create unit tests for role-based authorization.
    - [ ] Implement Feature: Define user roles (e.g., Administrator, Manager, Operator) in the `User` entity.
    - [ ] Implement Feature: Include user roles in the generated JWT.
    - [ ] Implement Feature: Create a `RolesGuard` to enforce role-based access control on routes.
    - [ ] Implement Feature: Apply `RolesGuard` to sample protected endpoints.
    - [ ] Write Tests: Create integration tests for role-based access control.

## Phase 6: Logging and Observability
- [ ] Task: Conductor - User Manual Verification 'Logging and Observability' (Protocol in workflow.md)
    - [ ] Implement Feature: Add logging for successful login attempts.
    - [ ] Implement Feature: Add logging for failed login attempts.
    - [ ] Implement Feature: Add logging for password reset requests.
    - [ ] Implement Feature: Ensure relevant information is logged (e.g., user ID, IP address, timestamp).
    - [ ] Write Tests: Verify logging functionality through integration tests or manual checks.
