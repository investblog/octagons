---
name: quality-perl
description: Quality gate for Perl. Apply when editing Perl in a project that uses it.
---

# quality-perl

After editing any Perl file:

- `perl -c <file>` — syntax check (built into perl, always available)
- `perlcritic <file>` — lint (if installed)
- `perltidy <file>` — format (if installed)

Baseline tools:

- syntax → `perl -c` (always available)
- lint → perlcritic — install when needed (not in the base system)
- format → perltidy — install when needed

Installing perlcritic / perltidy is a project decision (project principle: install when
needed) — record it in `./.agents/REGISTRY.md`.
