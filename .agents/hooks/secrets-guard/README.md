# secrets-guard

A PreToolUse agent hook — deterministically blocks reading/writing a **secret file**
(`.env`, `.env.*` except `*.example/.sample/.template`, `.dev.vars`, `.secrets`, `*.pem`,
`id_rsa`/`id_ed25519`). The belt to the `secrets` rule's suspenders: the agent *cannot*
leak a secret file, instead of being asked to remember not to.

It checks the tool's **file path** and its **shell command** (so `cat .env` is blocked too).
Templates (`.env.example`, …) are allowed.

## Per-agent install (bootstrap, step 4)
- **Claude** → merge `claude.json` into `./.claude/settings.json` (`hooks.PreToolUse`) — the
  COMMITTED file, so the hook is git-pinned (`settings.local.json` is gitignored; personal
  `permissions` go there). The command runs `guard.sh --claude` (exit 2 + stderr blocks the call).
- **Codex** → merge `codex.toml` into `./.codex/config.toml`. `guard.sh --codex` returns
  `{"hookSpecificOutput":{...,"permissionDecision":"deny"}}`. Verify the `matcher` tool names
  against your codex version.
- **opencode** → copy `opencode.ts` to `./.opencode/plugin/secrets-guard.ts` (throws to block).

`guard.sh` is the shared detector (path + command); the per-agent files only wire it in.
It resolves `AGENTS_PYTHON`, then `python3`, `python`, and `py -3`; Python absent → fail-open (allow).

## Scope / limits
Path- and command-based. A secret pasted as a literal value into a tool arg is not caught
here — the `secrets` rule + the git-quality-gate staged-secret scan cover commits.
