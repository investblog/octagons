---
name: project-docs
description: Project docs, plans, decisions, knowledge — must-have, kept current, ALL in the project (never home). Apply when maintaining docs, plans, decisions, or context.
---

# project-docs

Documentation is **must-have**, not optional; kept current alongside the code. Everything is
**Markdown (`.md`) by default** — greppable, diffable, plain-text source.

[CRITICAL] Plans, docs, decisions, and intermediate work-artifacts live **ONLY in the project** —
never `~/.claude/`, `~/.codex/`, `~/.config/opencode/`, or any home/global agent folder (agent machine
state — doesn't travel with the repo, pollutes other projects). Scratch/temp → the session scratchpad
or a gitignored project dir, never home.

## Folders by audience
The dividing axis: **what we AUTHOR** (plans / decisions / docs / content — our folders) vs **what we
CONSUME** (`context/` — external-origin inputs / raw source, not authored by us). Borderline items go
by origin+role: as-received → `context/`; our derived artifact → the authored folder. **Link, don't copy.**

- `docs/` — **dev/agent source of truth** we author: architecture, contracts, flows, `docs/decisions/` (ADR). Code follows docs.
- `./.agents/plans/{active,done}` — **agent + dev plans** (+ cross-session memory in `REGISTRY.md`); each
  active plan opens with a **handoff** note (done / what did NOT work / the single next step).
- **`context/`** — **inputs we CONSUME**: briefs, requirements, references, research sources, stakeholder
  material. Read-for-context, not authored here. (A raw brief → `context/`; the plan we derive → `plans/`;
  a meeting note → `context/`, its extracted decision → `docs/decisions/`.) Heavy media → `context/attachments/` (gitignored).
- **`content/`** — **deliverables for NON-dev audiences** (business / client / marketing / published). See `content-vault`.
- **user-docs** — README + a `docs/`|`wiki/`|`guide/` folder for **product users** (see `user-docs`).
- backlog index (`ROADMAP.md` / `docs/TODO.md`) — the single list of open work → links to `plans/active/`.

## Metadata, links, retrieval
- **Frontmatter** on docs/notes, so the agent filters by metadata without reading the full text:
  `type:` (decision|plan|note|draft|published) · `status:` (active|in_progress|done|archived) · `tags: [...]` · `project:`.
- **Links — standard Markdown relative links** `[text](path.md)` (portable, render on GitHub, exact path).
  NOT `[[wiki-links]]` (Obsidian-only — plain text on GitHub) unless the project actually runs Obsidian.
- **Diagrams — inline as code, not linked files (default).** Embed the diagram *source* as a fenced
  ` ```mermaid ` block in the doc — single source of truth, diffable, GitHub renders it natively. NOT
  `![](diagram.svg)` links to external image files (orphan assets, drift). Render to an image only at
  **export** time (PDF/docx — see `md2pdf`); externalize a diagram only to reuse one across N docs.
- **Read frontmatter first**, filter by `type`/`tags`/`status`, then read only the relevant bodies.
- **Agent-ignore** — an ignore list (`.aiignore`, or reuse `.gitignore`) so the agent skips attachments /
  archives / heavy binaries instead of full-scanning them into context; archive completed work **out** of active context.

## Discipline
- Contract-first: update the doc (schema/contract/behavior) **before** the code change, then code.
- Keep docs consistent with the code; mark assumptions. A plan: `active/` → `done/` on completion (drop its backlog item).
- A decision records **why** (context, decision, alternatives, dead-ends), not only what.

[CRITICAL] Do not ship a schema / contract / behavior change without updating its doc first.
