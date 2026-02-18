# Implementation Plan: Missing Backend APIs Integration

## Phase 1: Foundation & Discovery
- [ ] Task: Verify existing services and entities
    - [ ] Locate `ScheduleService`, `ConnectorService`, and `SqliteService` (or equivalent).
    - [ ] Confirm entity mappings for `ScheduleConfig`, `Connector`, and `SqliteConnection`.
- [ ] Task: Create DTOs for the new endpoints
    - [ ] Create `ScheduleConfigResponseDto`.
    - [ ] Create `ConnectorResponseDto`.
    - [ ] Create `SqliteConnectionResponseDto`.
    - [ ] Create `UpdateSqliteConnectionDto` for the PUT request.

## Phase 2: Controller Implementation (TDD)
- [ ] Task: Implement Schedule Configuration Endpoints
    - [ ] Write tests for `GET /api/v1/schedule/config` and `POST /api/v1/schedule/sync`.
    - [ ] Implement `ScheduleController` methods.
    - [ ] Apply `@Roles(Role.ADMIN)` guard.
- [ ] Task: Implement Connectors Endpoint
    - [ ] Write tests for `GET /api/v1/connectors`.
    - [ ] Implement `ConnectorsController` method.
    - [ ] Apply `@Roles(Role.ADMIN)` guard.
- [ ] Task: Implement SQLite Connections Endpoints
    - [ ] Write tests for `GET /api/v1/sqlite/connections` and `PUT /api/v1/sqlite/connections`.
    - [ ] Implement `SqliteConnectionsController` methods.
    - [ ] Apply `@Roles(Role.ADMIN)` guard.

## Phase 3: Documentation & Verification
- [ ] Task: Update Swagger Documentation
    - [ ] Add `@ApiTags` and `@ApiOperation` to new controllers.
    - [ ] Define `@ApiResponse` for all new endpoints.
- [ ] Task: Final Integration Check
    - [ ] Run all tests to ensure no regressions.
    - [ ] Verify endpoint accessibility via Swagger UI.
- [ ] Task: Conductor - User Manual Verification 'Missing Backend APIs Integration' (Protocol in workflow.md)
