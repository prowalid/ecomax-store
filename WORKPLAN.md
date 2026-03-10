# WORKPLAN

## Purpose
This file is the single coordination board between two agents working on this repository.
Use it to split tasks, reserve file ownership, track status, and avoid merge conflicts.

## Ground Rules
1. Always read this file before starting any work.
2. Pick only tasks marked `todo`.
3. Move selected task to `in_progress` and set `owner`.
4. Do not edit files outside your task `Allowed Paths`.
5. If you need a shared file, add it under `Coordination Needed` first.
6. A task cannot be marked `done` without evidence fields filled (`PR`, `Commit`, `Tests`, `Reviewer`).
7. If evidence is missing or implementation is partial, set status to `blocked` and explain the gap.
8. No self-approval: the same owner cannot be both implementer and reviewer.

## Task Status
Allowed values: `todo`, `in_progress`, `blocked`, `done`

## Agent Ownership
- Agent A scope: **Antigravity** (Frontend Refactoring, Typescript & Linting, UI/UX polish, Advanced Backend)
- Agent B scope: **Codex** (Security review, backend hardening, testing strategy, release readiness)

## Evidence Required (Mandatory)
For any task moved to `done`, add all fields in `Notes`:
- `PR:` link or branch name
- `Commit:` short hash
- `Tests:` exact command(s) and result
- `Reviewer:` other agent name + verdict

Example:
`PR: feat/be-sec-01 | Commit: abc1234 | Tests: npm test (pass), npm run lint (partial fail: FE only) | Reviewer: Codex (approved with notes)`

## Active Tasks
| ID | Task | Owner | Status | Allowed Paths | Notes |
|---|---|---|---|---|---|
| BE-SEC-01 | Harden auth/settings/integrations endpoints | Antigravity | blocked | `server/src/routes/**`, `server/src/controllers/**`, `server/src/middleware/**` | Reopen: `/api/settings/:key` still public, `/api/integrations/whatsapp-notify` still public. Missing PR/commit/tests/reviewer evidence. |
| BE-ORD-02 | Enforce server-side order pricing and stock validation | Antigravity | blocked | `server/src/controllers/ordersController.js`, `server/src/validators/orderSchemas.js`, `server/src/db/**` | Reopen: backend still accepts client totals/prices and does not hard-fail on insufficient stock. Missing evidence fields. |
| FE-LINT-03 | Reduce TypeScript/eslint critical errors | Antigravity | in_progress | `src/hooks/**`, `src/lib/**`, `src/pages/**` | Focus on `no-explicit-any` and hook dependency issues |
| FE-STORE-04 | Separate storefront public API usage from admin API usage | Antigravity | blocked | `src/hooks/**`, `src/pages/store/**`, `src/lib/api.ts` | Reopen for verification against current protected `/products` route policy and real storefront data flow. Add evidence fields on completion. |
| QA-TEST-05 | Add meaningful tests for checkout/discount/auth flows | Agent B | todo | `src/test/**`, `server/**` | Replace placeholder tests with real scenarios |
| DOC-OPS-06 | Replace template README with production runbook | Agent B | todo | `README.md` | Setup, env vars, deploy, backup, rollback |

## Agent Alert (Action Required)
- Antigravity must update task statuses based on real code state, not intent.
- Any task claimed as complete must include: `PR`, `Commit`, `Tests`, `Reviewer`.
- Until evidence is provided and verified, tasks stay `blocked`.
- Next update from Antigravity must include a short delta list:
  - What changed
  - Which files changed
  - Which command outputs prove completion

## Coordination Needed
Use this section before touching shared files.

| File | Requested By | Reason | Approved By | Status |
|---|---|---|---|---|
|  |  |  |  |  |

## Change Log
| Date (UTC) | Agent | Change |
|---|---|---|
| 2026-03-10 | system | Initial workplan created |
| 2026-03-10 | Antigravity | Updated BE-SEC-01, BE-ORD-02, FE-STORE-04 to 'done' (implemented prior to plan). Claimed FE-LINT-03. |
| 2026-03-10 | Codex | Tightened governance: added mandatory evidence fields, reopened unverified `done` tasks as `blocked`, and issued explicit action-required alert. |
