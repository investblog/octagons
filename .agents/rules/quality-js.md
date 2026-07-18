---
name: quality-js
description: Quality gate for JavaScript/TypeScript. Apply when editing JS/TS in a project that uses it.
---

# quality-js

Run each check at its moment, not all at once:

- after any change → `npx eslint .` (or `npm run lint`)
- before marking a task done → `npx tsc --noEmit`
- before push → `npm run build` (compile check — bundler / wrangler, if a `build` script exists)
  then `npm test` (vitest / playwright per project)

Baseline tools — local to the project (devDependencies), run via npx / npm scripts:

- lint → eslint (flat config, ESLint 9+)
- type-check → tsc (`--noEmit`)
- build → the project's bundler/compiler (`npm run build`; e.g. wrangler for Workers) — a compile check before push
- format → prettier — optional; only where the project already has it
- tests → vitest (unit/integration) + playwright (e2e), per project

[CRITICAL] eslint does not validate types — tsc does. Keep them separate.

Project specifics (eslint plugins such as eslint-plugin-astro, build adapter, edge-compat
checks, workers-pool test config) are **not** baseline — they live in the project and are
recorded in `./.agents/REGISTRY.md`.
