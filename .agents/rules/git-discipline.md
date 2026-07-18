---
name: git-discipline
description: Git hygiene. Apply in any project under version control.
---

# git-discipline

- **Commit after each completed unit of plan/task work — MANDATORY, do NOT ask.** Git is cheap; the
  commit IS the checkpoint (the plan-step boundary / handoff point), so "should I commit?" is noise —
  just commit. Small, traceable commits. (**Pushing** is different — it still needs an explicit go; see below.)
- Stage explicit paths (`git add <files>`), not `git add -A` by default — guards against
  committing secrets or generated artifacts.
- Commit message: Conventional Commits — `<type>(<scope>): <imperative summary>`, where
  `type` ∈ feat / fix / docs / refactor / test / chore / perf. Body explains **why** (not
  what — the diff shows what) when non-trivial; footer for refs / trailers. **No emoji.**
- Do not push to `main` directly without an explicit request — work via a branch/PR or an
  explicit merge after review.
- Do not skip pre-commit / pre-push hooks without an explicit request.

[CRITICAL] Never `git push --force` on `main`.
[CRITICAL] Never commit secrets (`.env`, `.dev.vars`, tokens) or generated artifacts
(`dist/`, build caches). See `secrets`.
