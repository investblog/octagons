---
name: quality-py
description: Quality gate for Python. Apply when editing Python in a project that uses it.
---

# quality-py

Run each check at its moment, not all at once:

- after any change → `ruff check .`
- before marking a task done → `pyright` (strict mode)
- before commit/push → tests (`pytest` is the default; use the project's runner if it configures another)

Baseline tools — do not silently swap:

- lint → ruff (`ruff check`)
- format → ruff (`ruff format`); some projects use black instead — match the project
- type-check → pyright, strict. **Not mypy.**
- tests → pytest (the Python default; the project's runner wins if it uses another)

[CRITICAL] ruff is not a type-checker; the formatter is not a linter. Keep them separate.

Project specifics (venv path, `PYTHONPATH`, single-file invocation) are **not** baseline —
they live in the project and are recorded in `./.agents/REGISTRY.md`.
