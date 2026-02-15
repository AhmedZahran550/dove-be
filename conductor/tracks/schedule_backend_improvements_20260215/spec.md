# Specification: Schedule Module Backend Improvements

## Overview
This track aims to improve the consistency and reliability of the schedule module's backend API. It focuses on standardizing column definitions to use `camelCase`, ensuring critical system columns like `woId` are always present, and guaranteeing that date fields (`dueDate`, `releaseDate`) are correctly populated during Excel ingestion.

## Functional Requirements

### 1. Standardize Column Definitions (`GET /schedule/columns`)
- **CamelCase Normalization:** Update the column normalization logic to produce `camelCase` instead of `snake_case`.
    - `work_order_id` -> `woId`
    - `due_date` -> `dueDate`
    - `release_date` -> `releaseDate`
- **Guaranteed "Work Order ID" Column:** Ensure that the response for `GET /schedule/columns` always includes a definition for `woId` (Work Order ID), even if it's not explicitly mapped in the database.
- **Payload Alignment:** The `normalizedName` property in the column objects must match the JSON keys returned in the `GET /schedule/list` payload exactly.

### 2. Reliable Data Population (`GET /schedule/list` & Import)
- **Excel Date Parsing:** During Excel upload (`POST /schedule/import`), explicitly parse the "Due Date" and "Release Date" columns from the Excel sheet.
- **Entity Population:** Ensure the `dueDate` and `releaseDate` fields on the `ScheduleData` entity are populated from the parsed Excel data if they are not already set.
- **Null Prevention:** The `GET /schedule/list` response must return non-null values for `woId`, `dueDate`, and `releaseDate` whenever the data exists in the `rawData` (Excel blob).

## Technical Constraints & Considerations
- **Backward Compatibility:** Existing `snake_case` normalization rules in the database should be handled gracefully or migrated if necessary.
- **Data Integrity:** The `rawData` field should remain unchanged, serving as the source of truth for the original Excel row.
- **Type Safety:** Maintain `varchar` types for date fields as currently defined in the `ScheduleData` entity to avoid breaking existing logic, while ensuring the string format is consistent.

## Acceptance Criteria
- `GET /schedule/columns` returns `normalizedName` in `camelCase`.
- `GET /schedule/columns` always includes an entry for `woId`.
- Uploading an Excel file with "Due Date" and "Release Date" columns results in populated `dueDate` and `releaseDate` fields in the database and API responses.
- `GET /schedule/list` returns `woId` matching the column definition's `normalizedName`.

## Out of Scope
- Frontend changes (removing manual workarounds in the React components).
- Migration of existing database records (only new imports/updates are required to be fixed).
