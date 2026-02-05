# Workflow

This document outlines the standard development workflow for projects managed by Conductor.

## Core Principles

*   **Test-Driven Development (TDD):** All new features and bug fixes will follow a TDD approach. Tests must be written before implementation code.
*   **Small, Incremental Commits:** Changes should be committed frequently, after each logically complete task, to maintain a clear history and facilitate review.
*   **Git Notes for Task Summaries:** Detailed task summaries, including rationale and specific implementation notes, will be recorded using Git Notes rather than lengthy commit messages. This keeps commit messages concise while providing rich context.

## Workflow Steps

### Phase 1: Task Breakdown & Planning
1.  **Understand Task:** Review the track's specification (`spec.md`) and plan (`plan.md`).
2.  **Breakdown into Sub-tasks:** Further decompose complex tasks into smaller, manageable sub-tasks in `plan.md`.
3.  **Identify Affected Areas:** Determine which parts of the codebase will be affected by the changes.

### Phase 2: Implementation (Iterative)
For each sub-task:
1.  **Write Tests:**
    *   Create new unit and integration tests that specifically target the functionality to be implemented.
    *   Ensure tests accurately reflect the desired behavior and fail initially.
    *   Required test code coverage: >80%.
2.  **Implement Feature:**
    *   Write the minimum amount of code necessary to make the newly written tests pass.
    *   Adhere to established code style guides (`code_styleguides/`).
3.  **Refactor & Optimize:**
    *   Refactor the code to improve readability, maintainability, and performance, ensuring all tests continue to pass.
    *   Remove any dead code or technical debt identified during implementation.
4.  **Commit Changes:**
    *   Commit changes after every task.
    *   Write a concise commit message summarizing the *what* and *why* of the change.
    *   Record a detailed task summary in Git Notes, including design decisions, potential alternatives considered, and any relevant context.

### Phase 3: Verification & Review
1.  **Run All Tests:** Execute the full test suite to ensure no regressions have been introduced.
2.  **Code Review:** Submit changes for code review. Address any feedback provided.
3.  **Phase Completion Verification and Checkpointing Protocol:**
    *   Manually verify the implemented features against the `spec.md`.
    *   Update the `plan.md` to mark completed tasks.
    *   Commit the `plan.md` changes.

## Tooling

*   **Version Control:** Git
*   **Task Tracking:** Conductor tracks and plans (`conductor/tracks/`)
*   **Code Quality:** (To be defined based on project's tech stack and style guides)
