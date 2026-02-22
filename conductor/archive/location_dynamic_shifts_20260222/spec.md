# Specification: Dynamic Location Shifts and Admin Invitations

## 1. Overview
This track updates the location management system to support dynamic shifts stored as JSONB and automates the invitation process for location administrators.

## 2. Functional Requirements

### 2.1 Schema Updates
- **Location Entity**:
  - Add a `shifts` column (type: `jsonb`, nullable: true) to store the array of shift objects.
  - Remove the existing `email` column.
  - Ensure `managerEmail` is used for location administration.
- **Shift Structure**:
  - `name`: String (required)
  - `start`: String (required, e.g., "08:00 AM")
  - `end`: String (required, e.g., "04:00 PM")

### 2.2 API Updates (`POST /locations` & `PATCH /locations/:id`)
- **DTO Updates**:
  - Update `CreateLocationDto` and `UpdateLocationDto` to include the `shifts` array.
  - Include `adminEmail` (optional) in the payload.
  - `code` will be a string (max 20 chars, uppercase, provided by frontend).
- **Mapping**:
  - `adminEmail` -> `managerEmail`.
  - `address` -> `addressLine1`.
  - `state` -> `stateProvince`.
- **Validation**:
  - Each shift must have a name, start time, and end time.
  - End time must be chronologically after the start time within the same 24-hour cycle (handling AM/PM).
  - Empty `shifts` array `[]` is allowed.

### 2.3 Invitation Logic
- When a location is created or updated with a `managerEmail`:
  - Verify if a user with that email already exists.
  - Verify if a pending invitation already exists for that email and location.
  - If neither exists, trigger a `LOCATION_ADMIN` invitation for that email and location.

## 3. Technical Constraints
- Use a database migration to add the `shifts` column and remove the `email` column.
- Use `class-validator` for DTO validation.
- Ensure the invitation logic is integrated into the `LocationsService` and uses the existing `InvitationsService`.

## 4. Acceptance Criteria
- [ ] `POST /locations` successfully creates a location with dynamic shifts.
- [ ] `PATCH /locations/:id` successfully updates shifts.
- [ ] `managerEmail` correctly receives an invitation if it's new.
- [ ] Database schema matches the new requirements.
- [ ] Shifts validation correctly handles AM/PM formats and time ranges.
- [ ] Automated tests cover the new creation and invitation logic.
