---
name: code-review
description: Code review protocol — gates first, trace to task, severity-tagged feedback. Apply when reviewing a diff or PR.
---

# code-review

The review side of `proof-loop` (independent verification, not self-certification).

## Before review
- Pull the change locally (or open the PR). Run the quality gates (`quality-*`): lint / typecheck / build.
- If a gate fails — that is already a blocker; stop there.

## What to check
1. **Fit to task** — every changed line traces to a task item; stray edits → ask "why this?".
2. **Security** — secrets, input validation, auth guards on protected routes (see `secrets`).
3. **Edge-compat** — no Node APIs in runtime code, where the project targets CF Workers (see `edge-compat`).
4. **Schema/migrations** — a schema change is a new migration, not an edit to a committed one.
5. **Tests** — coverage matches the change, by the project's standard.
6. **The project's own rules** — boundaries, conventions, ownership.

## Feedback
- **Critical** — blocks merge: security, edge-compat, schema drift, broken build.
- **Warning** — strongly advised: boundary violations, inconsistent shapes, missing auth guard.
- **Info** — style, naming, minor improvements.

Each item is `file:line` + a recommendation. No vague comments.

## After
- Critical → back to the author with a handoff spec.
- Warning / Info → in the review response; merge at the lead's discretion.
