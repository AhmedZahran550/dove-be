# Specification: Fix Schedule API Responses

## Overview
This track focuses on updating the response structure of two key endpoints in the Schedule module: `/api/v1/schedule/config` and `/api/v1/schedule/columns`. These changes are required to fix current data structure inconsistencies and ensure compatibility with the frontend.

## Functional Requirements

### 1. Update `GET /api/v1/schedule/config` Response
- **Goal:** Ensure the response is wrapped in a `scheduleFile` object with a top-level `success` flag.
- **Desired Response Body Structure:**
  ```json
  {
    "success": true,
    "scheduleFile": {
      "id": "uuid",
      "company_id": "uuid",
      "file_name": "string",
      "file_path": "string | null",
      "file_url": "string | null",
      "source_type": "string",
      "sync_frequency": "string",
      "auto_sync_enabled": "boolean",
      "publish_to_schedule_page": "boolean",
      "is_active": "boolean",
      "last_synced_at": "ISO8601 string",
      "metadata": {
        "size": "number",
        "type": "string",
        "lastModified": "number"
      },
      "uploaded_by": "uuid",
      "created_at": "ISO8601 string",
      "updated_at": "ISO8601 string",
      "file_hash": "string | null",
      "last_sync_status": "string",
      "last_sync_error": "string | null",
      "sync_retry_count": "number",
      "next_retry_at": "ISO8601 string | null",
      "email_notifications": "boolean",
      "automatic_backups": "boolean"
    }
  }
  ```
- **Mandatory Fields (Must be present):** `id`, `company_id`, `file_name`, `metadata`.

### 2. Update `/api/v1/schedule/columns` Response
- **Goal:** Standardize the column information and normalization rules response.
- **Desired Response Body Structure:**
  ```json
  {
    "success": true,
    "scheduleDataColumns": [
      { "excelName": "string", "normalizedName": "string" }
    ],
    "workOrderColumns": [],
    "normalizationRules": {
      "Excel Header": "normalized_name"
    },
    "totalColumns": "number",
    "_debug": {
      "company_id": "uuid",
      "scheduleColumnNames": ["string"],
      "scheduleColumnCount": "number",
      "workOrderColumnCount": "number"
    }
  }
  ```
- **Constraint:** The `_debug` field must be included in the response across all environments (including production).

## Non-Functional Requirements
- **Consistency:** Align with the project's existing response wrapping patterns (likely handled via NestJS interceptors or custom DTOs).

## Acceptance Criteria
- `GET /api/v1/schedule/config` returns the exact structure specified above.
- The `/schedule/columns` endpoint returns the exact structure specified above, including the `_debug` field.
- Mandatory fields in the `scheduleFile` object are never missing.
- Existing functionality for these endpoints (logic-wise) remains unchanged.

## Out of Scope
- Modifying the schedule processing logic or file upload mechanism.
- Updating database entities (unless existing fields are insufficient for the response).
- Changing response formats for other modules.
