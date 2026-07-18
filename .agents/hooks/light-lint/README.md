# light-lint

A PostToolUse agent hook — fast, **non-blocking** lint of the just-edited file, for
immediate feedback (ties to the `quality-*` rules). Unlike the git-quality-gate (which
blocks on commit/push), this only *reports*: it always exits 0 and never blocks an edit.

Lints by extension on the single changed file: ruff (`.py`), eslint (`.ts/.js/...`),
shellcheck (`.sh`), `perl -c` (`.pl/.pm`). Skip-if-missing — a missing linter is silently
skipped (it is a convenience; the git-gate is the real gate).

## Per-agent install (bootstrap, step 4 — config assembly)
- **Claude** → merge `claude.json` into `./.claude/settings.json` (`hooks.PostToolUse`) — the
  COMMITTED file (git-pinned; `settings.local.json` is gitignored, personal `permissions` only).
- **Codex** → merge `codex.toml` into `./.codex/config.toml` (parses the `apply_patch` patch
  for changed files). Verify the `matcher` tool name for your codex version.
- **opencode** → copy `opencode.ts` to `./.opencode/plugin/light-lint.ts`.

`lint.sh` is the shared linter (path + codex-patch parsing); the per-agent files wire it in.
