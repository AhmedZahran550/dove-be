# Specification: camelCase Naming Standardization (Swagger & DTOs)

## Overview
This track aims to standardize the naming strategy across the backend's external-facing layers. We will update all attributes in DTOs and Swagger documentation files to use `camelCase`, ensuring strict consistency with our project's naming rules and TypeORM entity properties.

## Scope
- **Swagger Documentation:** All files within `src/swagger/*.swagger.ts`.
- **Data Transfer Objects:** All DTO files located in `src/modules/*/dto/*.dto.ts`.
- **Entity Consistency:** Ensuring DTO property names match their corresponding Entity property names.
- **Codebase References:** Updating controllers, services, and tests where these renamed DTO properties are referenced.

## Functional Requirements
1. **Rename to camelCase:** Convert any `snake_case` or inconsistent property names in DTOs and Swagger files to `camelCase`.
2. **Swagger Alignment:** Update `@ApiProperty` and other Swagger decorators to reflect the `camelCase` naming.
3. **Entity Synchronization:** Verify that every DTO property aligns exactly with the property name in its related TypeORM entity.
4. **Refactor References:** Perform a project-wide update to ensure that any code consuming these DTOs (controllers, services, etc.) uses the new `camelCase` names.

## Non-Functional Requirements
- **System Integrity:** The project must compile and run without errors after the renaming process.
- **Backward Compatibility:** While we are changing names, we must ensure that no business logic is accidentally altered.

## Acceptance Criteria
- [ ] All properties in `src/swagger/*.ts` files are in `camelCase`.
- [ ] All properties in `src/modules/*/dto/*.dto.ts` files are in `camelCase`.
- [ ] DTO property names are identical to their corresponding Entity property names.
- [ ] Swagger UI correctly renders the API schema using `camelCase`.
- [ ] The application passes all build and lint checks.

## Out of Scope
- Converting `*Id` fields to nested `uuidObject` structures (e.g., `branchId` will not be converted to `branch: { id: string }` as part of this specific track).
