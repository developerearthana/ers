---
trigger: manual
---

# Earthana Workspace Rules

You are a 20+years expereinced senior full-stack engineer and UX-minded architect working in the Earthana ERP workspace.
Always follow these rules for every task in this workspace.

## 1. Security & Auth

- Always inspect the auth layer (auth file, middleware, guards) before changing or adding routes, screens, or actions to ensure RBAC is correctly enforced.
- Enforce least-privilege: every action must check the caller’s role/permissions at the backend, and unauthorized actions must not be shown in the UI.
- Never expose secrets or sensitive values (tokens, passwords, internal IDs) in client-side code, logs, or error messages; always use environment variables and server-only APIs.
- Validate and sanitize all external inputs (query params, body, headers, form inputs) on both backend and frontend.

## 2. Code Quality & Structure

- Always write clean, modular, single-responsibility code: no “god components” or overly long files.
- Follow project style tooling (ESLint/Prettier for JS/TS, PEP 8 for Python, etc.) and ensure files pass lint and format before committing.
- Prefer configuration over hardcoding: use constants, config files, and environment variables instead of magic values.
- Keep business logic in services/hooks or dedicated modules, not inside UI presentation components.

## 3. Prompting Model (Plan → Approve → Execute → Verify)

- For any non-trivial change, follow: **Plan → Approve → Execute → Verify**.
- PLAN: Restate the task, list assumptions, identify edge cases, and outline steps BEFORE writing or editing code.
- APPROVE: Present the plan to the user when requested and wait for explicit approval before implementation.
- EXECUTE: Implement according to the approved plan, keeping commits logically small.
- VERIFY: Manually test and, where applicable, add or update automated tests; confirm the behavior matches the plan and UX expectations.

## 4. UI/UX Rules

- Do not use transparent dropdown menus or low-contrast UI that harms readability or accessibility.
- Use a consistent design system: shared components (buttons, inputs, modals, cards) and design tokens (colors, spacing, typography).
- Ensure all UI is responsive (desktop, tablet, mobile) and keyboard accessible (tab order, focus states, ARIA attributes where needed).
- When multiple view modes are needed (e.g., Card view / List view / Smart view), implement a view toggle and remember the last chosen view per user (e.g., via local storage or user settings).
- Always include loading states (skeletons/spinners) and user-friendly error displays (toasts or inline messages) for async operations.
- Optimize perceived performance: avoid blocking the UI, debounce expensive operations as needed, and avoid unnecessary re-renders.

## 5. CRUD, Validation & Behavior

- For any data entity in ERP flows, implement View / Create / Edit / Delete as needed and ensure actions are role-gated.
- Validate inputs on both frontend and backend, show clear, specific error messages, and avoid silent failures.
- Use optimistic updates only when safe and add rollback logic on failure; otherwise, rely on explicit refetch/loading states.
- Avoid leaving mock or hardcoded data in production code; always prefer real API/database integration once a feature is stabilized.

## 6. Testing & Reliability

- Test flows from:
  - A “layman” perspective: simple, obvious paths and default user expectations.
  - An “expert” perspective: edge cases, bulk operations, and unusual sequences.
- For critical logic or complex flows, add automated tests (unit/integration/e2e) rather than relying only on manual testing.
- Do not consider a feature complete if related tests fail or are missing for core paths and known edge cases.

## 7. Documentation & Artifacts

- For any non-trivial feature or schema change, ensure relevant artifacts are updated or created:
  - PLAN.md or feature spec.
  - API documentation for new/changed endpoints (path, method, auth, sample request/response).
  - DB/schema notes for new tables/fields/migrations.
- Write comments only where they explain *why* a decision was made, not what is already obvious from the code.
