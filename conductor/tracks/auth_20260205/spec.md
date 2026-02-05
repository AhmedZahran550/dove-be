# Track: Implement the core user authentication flow

## Specification

### 1. Overview
This track focuses on establishing a robust and secure user authentication system for the Industrial/Manufacturing Management System. It will enable users (Factory Managers/Administrators and Machine Operators/Floor Workers) to register, log in, and maintain authenticated sessions. The system will utilize JWT (JSON Web Tokens) for stateless authentication and Passport.js with Argon2 for secure password hashing.

### 2. Functional Requirements

*   **User Registration:**
    *   Users must be able to register with a unique email address and a strong password.
    *   The system must securely hash passwords using Argon2 before storing them.
    *   Upon successful registration, a user account should be created with a default role (e.g., 'Operator') and marked as pending email verification.
    *   An email verification token should be generated and sent to the registered email address.

*   **User Login:**
    *   Registered users must be able to log in using their email address and password.
    *   The system must verify the provided password against the stored hashed password using Argon2.
    *   Upon successful authentication, a JWT must be generated and returned to the client.
    *   The JWT should contain essential user information (e.g., user ID, roles) and have an appropriate expiration time.

*   **Session Management (JWT-based):**
    *   Authenticated users must be able to access protected resources by providing a valid JWT in their requests.
    *   The system must validate the JWT on each protected request, ensuring its authenticity and expiration.
    *   Implement mechanisms for token refreshing (optional, but recommended for long-lived sessions).

*   **Password Reset:**
    *   Users must be able to request a password reset if they forget their password.
    *   A secure, time-limited password reset token must be generated and sent to the user's registered email address.
    *   Users must be able to set a new password using the valid reset token.

*   **User Roles and Authorization:**
    *   The system must support different user roles (e.g., Administrator, Manager, Operator).
    *   The JWT should include user role information to facilitate authorization checks on protected routes.

### 3. Non-Functional Requirements

*   **Security:**
    *   Passwords must be hashed using Argon2 (not less secure methods like bcrypt or PBKDF2).
    *   JWTs must be signed with a strong secret key and have a reasonable expiration time.
    *   Protection against common web vulnerabilities (e.g., brute-force attacks, injection attacks).
*   **Performance:**
    *   Authentication endpoints should respond within acceptable timeframes (e.g., <200ms).
*   **Scalability:**
    *   The authentication system should be designed to handle a growing number of users and requests.
*   **Maintainability:**
    *   Code should be well-structured, documented, and adhere to NestJS best practices and TypeScript style guides.
*   **Observability:**
    *   Logging for authentication events (successful login, failed login attempts, password resets) must be implemented.

### 4. Out of Scope

*   Social logins (e.g., Google, Facebook)
*   Multi-factor authentication (MFA)
*   Complex access control lists (ACLs) beyond basic role-based authorization.
