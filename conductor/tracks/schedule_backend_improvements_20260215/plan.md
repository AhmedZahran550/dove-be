# Implementation Plan: Schedule Module Backend Improvements

## Phase 1: Normalization & Mapping Logic Update
Standardize the column normalization and mapping utilities to use camelCase and ensure system columns are handled correctly.

- [x] Task: Update `normalizeColumnName` in `src/utils/schedule-normalizer.ts` to produce `camelCase` instead of `snake_case`. [9b17047]
    - [ ] Modify the regex/logic to capitalize words after spaces/underscores.
    - [ ] Update `COLUMN_ALIASES` to use `camelCase` keys.
- [ ] Task: Update `getDefaultColumnMapping` in `src/utils/column-mapping.ts` to ensure consistency with `camelCase` entity fields.
- [ ] Task: Update `transformToScheduleData` in `src/utils/column-mapping.ts` to explicitly handle `dueDate` and `releaseDate` extraction from mapped fields.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Normalization & Mapping Logic Update' (Protocol in workflow.md)

## Phase 2: Service Layer & API Enhancements
Update the `ScheduleService` to enforce the new column standards and ensure `woId` is always present in column definitions.

- [ ] Task: Modify `getScheduleColumns` in `src/modules/schedule/schedule.service.ts`.
    - [ ] Ensure `woId` is always included in the returned array.
    - [ ] Ensure all `normalizedName` values are returned in `camelCase`.
- [ ] Task: Update `importSchedule` in `src/modules/schedule/schedule.service.ts`.
    - [ ] Verify that `normalizationRules` are correctly generated/re-generated for the company if they don't match the new `camelCase` standard.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Service Layer & API Enhancements' (Protocol in workflow.md)

## Phase 3: Verification & Quality Assurance
Ensure all changes are verified with tests and meet the acceptance criteria.

- [ ] Task: Create unit tests for `normalizeColumnName` to verify `camelCase` output.
- [ ] Task: Create integration tests for `GET /schedule/columns` to verify `woId` presence and `camelCase` names.
- [ ] Task: Create integration tests for `POST /schedule/import` to verify `dueDate` and `releaseDate` are populated from Excel data.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Verification & Quality Assurance' (Protocol in workflow.md)
