---
name: secrets
description: Handling secrets. Apply whenever a secret (key, token, password, credential) is touched.
---

# secrets

- Secrets live outside the code and are never committed — gitignored, whatever the file is
  called (`.env`, `.env.local`, `.dev.vars`, `.secrets`, vault, CI secrets).
- Separate runtime-prod from local desired-state; what implements each is the project's choice.
- Write secrets via a stdin pipe, not interactively (interactive entry leaks into shell history).
- Never open a secret file with the `Read` tool — its values would enter your context/transcript.
  To use a value, pipe it (`grep ^KEY= … | cut -d= -f2- | …`); it must never appear in chat.
- Shred temp files holding secrets (`shred -u`). After changing a secret — redeploy.

[CRITICAL] Never put a secret value in chat, logs, commits, or error messages.

The concrete mechanism (`wrangler secret` / `.dev.vars` / vault / `.env`) is
project-specific — it lives in the project (and, when non-trivial, in a project skill),
recorded in `./.agents/REGISTRY.md`. A reusable `secrets` skill may back this rule; the
rule states the principle.
