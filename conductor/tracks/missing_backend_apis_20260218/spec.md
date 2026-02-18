# Specification: Missing Backend APIs Integration

## Overview
This track involves exposing a set of missing management and configuration API endpoints in the backend to support frontend functionality for schedule configuration, universal data connectors, and SQLite sync agent management. Based on initial assessment, the underlying services and entities are already implemented, so the focus is on controller implementation, DTO definition, and authorization.

## Functional Requirements
- **Schedule Configuration**
    - `GET /api/v1/schedule/config`: Retrieve the active schedule configuration (e.g., file name, source type, sync frequency).
    - `POST /api/v1/schedule/sync`: Trigger an immediate manual synchronization of the schedule data.
- **Universal Data Connectors**
    - `GET /api/v1/connectors`: Retrieve a list of all configured data connectors and their current connection status.
- **SQLite Sync Agent**
    - `GET /api/v1/sqlite/connections`: Retrieve a list of SQLite databases connected via local sync agents, including discovered tables and row counts.
    - `PUT /api/v1/sqlite/connections`: Update the configuration (selected table and tracking column) for a specific SQLite connection.

## Non-Functional Requirements
- **Authorization**: All endpoints must be restricted to users with the `ADMIN` role.
- **Validation**: Implement basic validation for the `PUT` request payload (e.g., valid UUID for `id`, non-empty strings for configuration fields).
- **Consistency**: Use existing DTO patterns and Swagger documentation standards established in the project.

## Acceptance Criteria
- All five endpoints are functional and return data matching the expected structures provided in the requirements.
- `POST /api/v1/schedule/sync` correctly triggers the existing sync service method.
- `PUT /api/v1/sqlite/connections` updates the connection configuration in the database.
- Non-ADMIN users receive a `403 Forbidden` response when attempting to access these endpoints.
- Swagger documentation is updated to include these new endpoints.

## Out of Scope
- Implementing new database migrations or core business logic (assumed to already exist).
- Frontend changes or UI integration.
