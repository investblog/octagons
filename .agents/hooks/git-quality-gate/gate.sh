#!/usr/bin/env bash
# git-quality-gate — run the project's quality checks by language.
# Usage: gate.sh <commit|push>
#   commit -> fast: secret scan (staged) + linters
#   push   -> full: linters + type-check + build + tests
# Exit 2 blocks the git operation. A missing tool is reported, not fatal
# (install-when-needed is a project decision; see the env-setup rule).

set -uo pipefail
[ -n "${AGENTS_DEBUG:-}" ] && set -x   # opt-in trace: AGENTS_DEBUG=1
mode="${1:-commit}"
root="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
cd "$root" || exit 0

fail=0
have()    { command -v "$1" >/dev/null 2>&1; }
miss()    { printf 'git-quality-gate: %s not found - skipped (install per env-setup)\n' "$1" >&2; }
run()     { echo "+ $*" >&2; "$@" || fail=1; }
tracked() { git ls-files -- "$@" | grep -q .; }

# --- secret scan (commit) — BUILT-IN grep, UNCONDITIONAL. NEVER skip-if-missing:
#     secrets are base/[CRITICAL]. External scanners only ADD to this, never replace it. ---
if [ "$mode" = commit ]; then
  staged="$(git diff --cached --name-only --diff-filter=ACM)"
  # secret files staged (templates .example/.sample/.template are allowed)
  if printf '%s\n' "$staged" | grep -iE '(^|/)(\.env(\..+)?|\.dev\.vars|\.secrets)$' \
       | grep -ivqE '\.(example|sample|template)$'; then
    echo "git-quality-gate: BLOCK - a secret file is staged (.env/.dev.vars/.secrets)" >&2; fail=1
  fi
  # private key material in staged content
  if git diff --cached -U0 --diff-filter=ACM | grep -qE -- '-----BEGIN [A-Z ]*PRIVATE KEY-----'; then
    echo "git-quality-gate: BLOCK - private key material is staged" >&2; fail=1
  fi
  # optional deeper scanner ADDS to the built-in (never the sole mechanism)
  if have gitleaks; then
    gitleaks protect --staged >/dev/null 2>&1 || { echo "git-quality-gate: gitleaks flagged staged content" >&2; fail=1; }
  fi
fi

# --- Python ---
if tracked '*.py' || [ -f pyproject.toml ]; then
  if have ruff; then run ruff check .; else miss ruff; fi
  if [ "$mode" = push ]; then
    if have pyright; then run pyright; else miss pyright; fi
    if have pytest; then run pytest -q
    elif have python3 && python3 -c 'import pytest' 2>/dev/null; then run python3 -m pytest -q
    else miss pytest; fi
  fi
fi

# --- JS/TS ---
if [ -f package.json ]; then
  if grep -q '"lint"' package.json; then run npm run -s lint
  elif npx --no-install eslint --version >/dev/null 2>&1; then run npx --no-install eslint .
  else miss eslint; fi
  if [ "$mode" = push ]; then
    if grep -q '"typecheck"' package.json; then run npm run -s typecheck
    elif npx --no-install tsc --version >/dev/null 2>&1; then run npx --no-install tsc --noEmit
    else miss tsc; fi
    grep -q '"build"' package.json && run npm run -s build   # compile check (bundler / wrangler)
    grep -q '"test"' package.json && run npm test --silent
  fi
fi

# --- Bash ---
if tracked '*.sh'; then
  while IFS= read -r f; do
    run bash -n "$f"
    if have shellcheck; then run shellcheck "$f"; fi
  done < <(git ls-files -- '*.sh')
fi

# --- Perl ---
if tracked '*.pl' '*.pm'; then
  while IFS= read -r f; do run perl -c "$f"; done < <(git ls-files -- '*.pl' '*.pm')
fi

# --- C++ (light syntax check) ---
if tracked '*.cpp' '*.cc' '*.cxx'; then
  if have g++; then
    while IFS= read -r f; do run g++ -fsyntax-only -std=c++17 "$f"; done < <(git ls-files -- '*.cpp' '*.cc' '*.cxx')
  else miss g++; fi
fi

if [ "$fail" -ne 0 ]; then
  echo "git-quality-gate ($mode): FAILED - fix the above (use --no-verify only with an explicit reason)" >&2
  exit 2
fi
echo "git-quality-gate ($mode): ok" >&2
exit 0
