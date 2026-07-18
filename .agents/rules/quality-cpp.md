---
name: quality-cpp
description: Quality gate for C++. Apply when editing C++ in a project that uses it.
---

# quality-cpp

After editing C++:

- compile with warnings → `g++ -Wall -Wextra -c <file>` (or the project's build)
- `clang-tidy <file>` — lint (if installed)
- `clang-format <file>` — format (if installed)

Baseline tools:

- compiler → g++ (with `-Wall -Wextra`)
- lint → clang-tidy — install when needed (not in the base system)
- format → clang-format — install when needed

Installing clang-tidy / clang-format is a project decision (project principle: install
when needed) — record it in `./.agents/REGISTRY.md`.
