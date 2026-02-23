---
description: Full stack Earthana ERP workflow – PLAN.md, implementation, verification and wiring screens to real backend.
---

# Earthana ERP Feature Workflow

Use this workflow for new features or major changes in the Earthana ERP app.
Always follow Plan → Approve → Execute → Verify.

## Part A: New Feature – Full Stack ERP Flow

### Phase 1: Planning Artifact (NO CODE YET)

1. Ask me to confirm the **Subject**, tech stack, and aesthetic, for example:
   - Subject: Full Stack [Earthana] ERP Application.
   - Tech Stack: [Next.js, MongoDB, Tailwind, JSON-based configs].
   - Aesthetic: [e.g., minimal, glassmorphic, corporate].
2. Create or update a `PLAN.md` in the workspace with:
   - Full folder structure tree:
     - Frontend: pages/routes, components, hooks, state management.
     - Backend: API routes/controllers, services, models, helpers.
     - Shared: types/interfaces, constants, utilities.
     - Config: env, build, linting, testing.
     - Tests: unit/integration/e2e layout.
   - Database schema description:
     - Entities, fields, types, and relationships (ER-style description).
     - Keys and indexes that matter for performance and constraints.
   - API route definitions:
     - Path, method, and purpose for each route.
     - Request/response schema (including validation rules).
     - Auth/RBAC requirements and roles allowed.
   - Dependencies:
     - Runtime dependencies (framework, DB driver/ORM, auth, UI kits).
     - Dev dependencies (linters, formatters, test frameworks, tooling).
   - Non-functional requirements:
     - Security (auth, RBAC, data protection).
     - Performance goals (expected data volumes, latency expectations).
     - Observability (logging, basic metrics).
3. STOP and present `PLAN.md` to me.
4. Wait for my explicit approval or requested edits before you write or modify any code.

### Phase 2: Implementation (After Approval)

5. Initialize the project and install dependencies exactly as defined in `PLAN.md`.
6. Set up the database connection and run migrations or schema synchronization:
   - Implement or update models.
   - Create required tables/collections and seed demo data.
   - Add a simple connectivity check (e.g., a health check route or script).
7. Implement backend logic first:
   - Core domain models and services.
   - API routes/handlers with:
     - Validation (payload, query, path params).
     - RBAC checks.
     - Consistent error handling with appropriate HTTP status codes.
     - Logging (without leaking sensitive data).
8. Implement frontend integration:
   - Main layouts and navigation for the ERP modules.
   - Screens wired to real APIs (no leftover mock data).
   - State management (if needed), loading states, error toasts, and empty states.
9. Keep commits logically grouped and small, following the structure defined in `PLAN.md`.

### Phase 3: Verification

10. Launch the app in the integrated browser.
11. Test key end-to-end flows:
    - Authentication and role-based access for relevant roles.
    - Core CRUD flows for one or more ERP entities.
    - Filters, search, pagination, and navigation.
12. Verify:
    - Data correctness from DB → API → UI and back for writes.
    - No major layout issues across common viewport sizes.
    - No uncaught errors in browser console or network tab.
13. Create a verification artifact:
    - A short written summary of flows tested and their status.
    - If possible, a video walkthrough or a series of screenshots showing data flowing from DB to UI.

---

## Part B: Wire Up a Specific Screen to Real Backend Logic

Use this section when I ask to wire a specific screen.

### Phase 1: Understand Context

14. Confirm details with me:
    - [Screen Name] (e.g., “Invoices List”, “Employee Dashboard”).
    - [Database Name] and [Table Name] (or collection/model).
    - [Model/Schema Name] used in code.
    - [Endpoint Path] for the API handler.
    - Specific logic required (e.g., filter by user ID, tenant ID, status, date range, totals).
15. Briefly restate the requirements in your own words and list any assumptions or questions.

### Phase 2: Backend – API & Logic

16. Create or update the API endpoint at `[Endpoint Path]`:
    - Read from `[Table Name]` in `[Database Name]`.
    - Apply the required business logic (filters, sorting, pagination, aggregation).
17. Wrap DB access in proper error handling:
    - Use try/catch.
    - Return meaningful HTTP status codes:
      - 2xx for success.
      - 4xx for client issues (e.g., invalid input, unauthorized).
      - 5xx for unexpected server errors.
18. Log errors with enough context (operation, entity, ID) but never include secrets or sensitive raw data.

### Phase 3: Database – Model & Migration

19. Verify that `[Model/Schema Name]` contains all necessary fields and relationships to support the screen.
20. If schema changes are needed:
    - Create a small Plan artifact (e.g., `PLAN_migration_[name].md`) describing:
      - New fields/tables/relations.
      - Migration strategy and impact.
    - Present the plan to me for approval.
    - After approval, implement migration and update models.

### Phase 4: Frontend – Wire Screen to Backend

21. Refactor `[File Path]`:
    - Remove hardcoded mock data.
    - Replace it with an async fetch/query to `[Endpoint Path]` (using the project’s data fetching strategy).
22. Implement:
    - Loading states (skeletons/spinners) for initial load and refetch.
    - Error handling with toast notifications or clear inline messages.
    - Empty-state UI when no data is returned.
23. If the screen supports multiple view modes (Card/List/Smart):
    - Implement a toggle between view modes.
    - Persist the user’s last chosen view and restore it on load.

### Phase 5: Verification & Diff

24. Use the browser to:
    - Navigate to [Screen Name].
    - Perform the key [Action] (e.g., create/update/delete/filter).
    - Confirm that the expected records are fetched/updated in `[Table Name]`.
25. Run relevant tests (unit/integration/e2e) for:
    - The API handler.
    - Any new hooks/components used for data fetching.
26. Show me:
    - The git diff of the API handler before committing, highlighting changes in:
      - Input validation.
      - Authorization.
      - Response shape.
    - The diff for `[File Path]` on the frontend, focusing on how mock data was replaced with real API calls.
27. Only consider the task complete after:
    - Tests pass.
    - Behavior matches the described business logic.
    - I confirm the diff and behavior are acceptable.