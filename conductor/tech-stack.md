# Tech Stack

## Overview
This project leverages a modern and robust technology stack designed for building efficient and scalable server-side applications.

## Core Technologies
-   **Programming Language:** TypeScript
    -   *Rationale:* Provides strong typing, enhanced code quality, and better maintainability for large-scale applications.
-   **Backend Framework:** NestJS
    -   *Rationale:* A progressive Node.js framework for building efficient, reliable, and scalable server-side applications. It uses modern JavaScript, is built with TypeScript, and combines elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming).
-   **Database:** PostgreSQL
    -   *Rationale:* A powerful, open-source object-relational database system known for its reliability, feature robustness, and performance. It is well-suited for complex data operations and high-volume environments.
-   **ORM (Object-Relational Mapper):** TypeORM
    -   *Rationale:* A highly capable ORM that supports multiple databases (including PostgreSQL) and works seamlessly with TypeScript. It simplifies database interactions and helps maintain a clean, object-oriented codebase.

## Key Libraries and Tools
-   **Authentication:** JWT (JSON Web Tokens) with Passport.js and Argon2
    -   *Rationale:* Provides secure, stateless authentication. Passport.js offers flexible authentication strategies, and Argon2 is a strong password hashing function, enhancing security.
-   **Email Service:** Resend/Nodemailer
    -   *Rationale:* Used for sending transactional emails, such as email verifications and invitations. Offers flexibility in email delivery and integration.
-   **Payment Processing:** Stripe
    -   *Rationale:* A widely used and secure platform for handling online payments and subscriptions, integrating seamlessly with web applications.
-   **Data Validation:** Zod / Class-validator
    -   *Rationale:* Ensures data integrity by providing powerful schema declaration and validation capabilities, crucial for API input and database consistency.