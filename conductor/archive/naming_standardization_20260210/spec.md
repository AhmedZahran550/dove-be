# Specification: naming_standardization_and_mapping_enhancement

## Overview
This track focuses on standardizing the naming conventions within the backend system. Specifically, it aims to ensure all ORM entity variables follow `camelCase` while maintaining the existing `snake_case` database schema via the custom naming strategy. Additionally, the track includes a review and enhancement of the company schedule column mapping logic to ensure it is robust and consistent with the updated naming conventions.

## Functional Requirements

### 1. Naming Standardization (ORM Entities)
- **CamelCase Properties:** Refactor all TypeORM entity classes to use `camelCase` for property names (e.g., `part_number` becomes `partNumber`).
- **Database Schema Integrity:** Ensure that changes to property names do not affect the existing database table or column names. The `CustomNamingStrategy` should continue to map `camelCase` properties to `snake_case` columns automatically.
- **Decorator Audit:** Review and update `@Column`, `@JoinColumn`, and other TypeORM decorators to ensure they are compatible with the property name changes and the naming strategy.

### 2. Schedule Mapping Logic Enhancement
- **Consistency:** Update the schedule mapping logic (primarily for company-specific column mappings) to use the new `camelCase` property names.
- **Mapping Robustness:** Review `src/utils/column-mapping.ts` and related services to ensure they correctly identify and map source file columns to the updated entity properties.
- **Validation:** Ensure that the mapping configuration stored in the database correctly references the `camelCase` property names of the entities.

## Non-Functional Requirements
- **Maintainability:** Standardized naming improves code readability and developer experience.
- **Backward Compatibility:** Existing database data and structures must remain intact.

## Acceptance Criteria
- [ ] All ORM entity properties are in `camelCase`.
- [ ] The system successfully connects to the database and performs CRUD operations without schema errors.
- [ ] Schedule uploads and processing correctly use the company-defined column mappings.
- [ ] Unit tests for entity mapping and schedule processing pass with the new naming convention.
- [ ] No regressions in existing features related to entities or schedule processing.

## Out of Scope
- Changing database table names or existing snake_case column names in the PostgreSQL schema.
- Refactoring variable names in the frontend or external API consumers (unless directly affected by the DTO/Entity changes).
