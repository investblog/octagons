---
name: user-docs
description: User-facing product documentation (README, wiki, API reference, usage, changelog). Apply when a change alters the product's external surface.
---

# user-docs

User-facing docs, separate from internal `project-docs`. Language: the user's / target
market's language (canon language policy), not English-by-default.

Audience here = **product users** (people using the product). Deliverables for OTHER non-dev
audiences — business / client / marketing / published content — are NOT user-docs; they live in
`content/` (see `content-vault`). Internal dev docs → `project-docs` (`docs/`); consumed inputs → `context/`.

## Locations
- `README` — the minimum: a brief description (what it is / how to run / how to use).
- A documentation folder for fuller product / API reference — its name **varies by project**
  (`docs/`, `wiki/`, `guide/`, …). Use whatever the project already has; do not impose a name.
- **Format: Markdown (`.md`) by default** — author README, wiki pages, and guides in md (readable,
  diffable, renders in git/wiki). Export/render only when the surface needs it (PDF via `md2pdf`,
  a generated API reference) — the Markdown stays the source. Don't hand-author HTML/PDF/docx.

## Duplicate here ONLY on an external-surface change
- new feature / changed behavior / new-or-changed API or CLI usage / user-set config → update user-docs.
- internal refactor, bug fix with no surface change, architecture / infra → stays in
  `project-docs` (agent docs), **NOT** duplicated here.

## Discipline
- After a surface-changing change, correct or create the user doc in the same session.
- Depth scales by project (library → API reference; CLI → usage; app → README + guide;
  internal tool → README only, or none).
