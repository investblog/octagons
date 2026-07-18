---
type: note
status: active
tags: [adr]
project: octagons
---

# Decisions (ADR)

One file per decision: `NNN-short-slug.md`, numbered, never renumbered. A decision records
**why** — context, decision, alternatives, dead ends — not only what.

Frontmatter: `type: decision` · `status: active|archived` · `tags: [...]` · `project:`.

## Recorded

- [001 — Draw edges, never fill them](001-line-art-over-fills.md)
- [002 — `step(dt)` rather than `render(absoluteTime)`](002-step-not-render.md)
- [003 — Publish over OIDC, with a one-time token bootstrap](003-publishing-over-oidc.md)

## Still worth writing up

- `field` over `lattice` as the flagship mode, and why the perspective-floor and
  wireframe-relief prototypes were dropped (perspective destroys the octagon's
  regularity; wireframe has no hidden-line removal).
- Naming: `octagons` over `octagons-lite`, done before the first publish because a global
  rename is free with zero consumers and breaking afterwards.
