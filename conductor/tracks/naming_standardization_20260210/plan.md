# Implementation Plan: Naming Standardization and Mapping Enhancement

This plan outlines the steps to standardize ORM entity naming to `camelCase` and enhance the schedule mapping logic for consistency.

## Phase 1: Preparation and Audit
- [x] Task: Audit all entities in `src/database/entities/` to identify non-camelCase properties.
- [x] Task: Audit `src/utils/column-mapping.ts` and `src/utils/schedule-normalizer.ts` for hardcoded property names.
- [x] Task: Verify `CustomNamingStrategy` in `src/database/custom-naming.strategy.ts` correctly handles `camelCase` to `snake_case` conversion.
- [x] Task: Conductor - User Manual Verification 'Preparation and Audit' (Protocol in workflow.md) [checkpoint: 4ccb5c2]

## Phase 2: Entity Refactoring (TDD)
- [ ] Task: Write unit tests to verify Entity-to-Database mapping for a sample of refactored entities.
- [ ] Task: Refactor properties in `src/database/entities/` to `camelCase`.
- [ ] Task: Update `@Column` and relation decorators (`@ManyToOne`, `@OneToMany`, etc.) to ensure explicit names are maintained if necessary.
- [ ] Task: Run tests to ensure `TypeORM` still maps correctly to the existing `snake_case` database schema.
- [ ] Task: Conductor - User Manual Verification 'Entity Refactoring' (Protocol in workflow.md)

## Phase 3: Mapping Logic Update
- [ ] Task: Write tests for `column-mapping.ts` utility using the new `camelCase` property names.
- [ ] Task: Update `src/utils/column-mapping.ts` to use `camelCase` properties when mapping file columns to entities.
- [ ] Task: Update `src/utils/schedule-normalizer.ts` to ensure consistency with refactored entities.
- [ ] Task: Conductor - User Manual Verification 'Mapping Logic Update' (Protocol in workflow.md)

## Phase 4: Data Consistency & Final Verification
- [ ] Task: Check existing data in `company_column_mapping` table (or equivalent) to see if it stores property names that need migration to `camelCase`.
- [ ] Task: If property names are stored as data, create a script/migration to update these values to `camelCase`.
- [ ] Task: Perform a full E2E test of the schedule upload and processing flow.
- [ ] Task: Conductor - User Manual Verification 'Final Verification' (Protocol in workflow.md)
