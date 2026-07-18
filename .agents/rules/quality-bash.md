---
name: quality-bash
description: Quality gate for shell scripts. Apply when editing bash/sh scripts.
---

# quality-bash

After editing any shell script:

- `bash -n <script>` — syntax check (built into bash, always available)
- `shellcheck <script>` — static analysis

Baseline tools:

- syntax → `bash -n` (always available)
- lint → shellcheck

If `shellcheck` is missing, install it (project principle: install when needed) and record
it in `./.agents/REGISTRY.md`.
