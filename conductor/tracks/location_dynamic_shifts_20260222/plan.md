# Implementation Plan: Dynamic Location Shifts and Admin Invitations

## Phase 1: Database and Entity Updates [checkpoint: b929a0c]
This phase focuses on updating the database schema and NestJS entities to reflect the new requirements.

- [x] **Task: Create Database Migration** (113a389)
  - Add `shifts` JSONB column to the `locations` table.
  - Remove the existing `email` column.
- [x] **Task: Update Location Entity** (113a389)
  - Modify `src/database/entities/location.entity.ts`:
    - Add `@Column({ type: 'jsonb', nullable: true }) shifts: any[];`
    - Remove the `email` property.
    - Ensure `managerEmail` is properly documented/used.
- [x] **Task: Update Location DTOs** (c6b8339)
  - Modify `src/modules/locations/dto/location.dto.ts`:
    - Update `CreateLocationDto` to include `shifts` (array of objects) and `adminEmail` (string).
    - Update `UpdateLocationDto` similarly.
    - Ensure mapping in `LocationsService` uses the correct fields.
- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Database and Entity Updates' (Protocol in workflow.md)**

## Phase 2: Validation and Utilities
This phase introduces validation logic for the new dynamic shift format.

- [x] **Task: Implement Shift Time Validation** (6e8d622)
  - Create a custom validation decorator or utility to:
    - Validate the time format (e.g., "08:00 AM").
    - Ensure the `end` time is after the `start` time.
  - Apply this validation to the `shifts` array in the DTOs.
- [x] **Task: Write Unit Tests for Shift Validation** (6e8d622)
  - Create a test file (e.g., `src/modules/locations/utils/shift-validator.spec.ts`) to verify various time range scenarios.
- [ ] **Task: Conductor - User Manual Verification 'Phase 2: Validation and Utilities' (Protocol in workflow.md)**

## Phase 3: Service Logic and Invitations
This phase updates the business logic to handle the new data and automate invitations.

- [ ] **Task: Update LocationsService Create Logic**
  - Modify `LocationsService.create` to:
    - Save the `shifts` JSONB array.
    - Map `adminEmail` to `managerEmail`.
    - Map `address` to `addressLine1` and `state` to `stateProvince`.
    - Trigger `InvitationsService.createInvitation` if `adminEmail` is provided.
- [ ] **Task: Update LocationsService Update Logic**
  - Modify `LocationsService.update` to:
    - Support updating the `shifts` array.
    - Trigger an invitation if `adminEmail` is updated to a new email address.
- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Service Logic and Invitations' (Protocol in workflow.md)**

## Phase 4: Integration Testing and Verification
This phase ensures everything works together correctly.

- [ ] **Task: Write E2E Tests for Location Creation with Shifts and Invitations**
  - Update or create E2E tests in `test/locations.e2e-spec.ts` (if it exists) or a new file.
  - Verify that shifts are saved correctly in the database.
  - Verify that an invitation record is created when an `adminEmail` is provided.
- [ ] **Task: Final Verification and Documentation**
  - Ensure all tests pass.
  - Check for regressions in other modules that might have used the location `email` column.
- [ ] **Task: Conductor - User Manual Verification 'Phase 4: Integration Testing and Verification' (Protocol in workflow.md)**
