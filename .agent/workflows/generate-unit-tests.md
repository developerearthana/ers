---
description: Analyze new or changed logic and generate/update unit tests, then run pytest and report failures.
---

# Generate Unit Tests Workflow

Follow this workflow whenever I request unit tests or after implementing new logic.

## Phase 1: Analyze Workspace

1. Scan the current workspace to detect:
   - New source files without tests.
   - Existing files where logic has been added or modified.
2. For each relevant file, list the public functions, classes, and methods that require unit test coverage.
3. Identify critical edge cases, error paths, and boundary conditions for each function or method.

## Phase 2: Generate Tests

4. For each source file, create or update a corresponding test file under `tests/`:
   - Use the same relative path as the source, but with `test_` prefix (e.g., `src/users.py` → `tests/test_users.py`).
5. Write unit tests that:
   - Are deterministic and do not depend on real external services (use mocks/fakes/stubs for I/O, DB, or network).
   - Test one behavior per test with clear, descriptive names.
   - Cover:
     - Happy paths.
     - Edge cases (empty inputs, invalid data, limits).
     - Expected error handling paths.
6. Ensure tests follow the project’s style guidelines and do not duplicate logic from production code.

## Phase 3: Run Tests

7. Run the full unit test suite using `pytest` (or the project-specific test command if different).
8. Collect and summarize results:
   - Total tests run.
   - Number passed, failed, and skipped.
   - For each failure:
     - Test name.
     - Error message and stack trace summary.
9. Do not treat the workflow as complete if there are failing tests directly related to the newly added or modified logic.

## Phase 4: Report Back

10. Present:
    - A short summary of coverage improvements (which modules gained or improved tests).
    - A list of remaining uncovered critical paths, if any, and suggestions for additional tests.
    - Instructions or diffs for any changes made to `tests/` files.