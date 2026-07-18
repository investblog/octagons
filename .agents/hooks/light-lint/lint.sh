#!/usr/bin/env bash
# light-lint — PostToolUse hook: fast, NON-BLOCKING lint of the just-edited file(s).
# Reads the tool-call JSON on stdin, lints changed files by extension, ALWAYS exits 0
# (info only — feedback to the agent on stderr). Skip-if-missing (a convenience, not a gate).
[ -n "${AGENTS_DEBUG:-}" ] && set -x   # opt-in trace: AGENTS_DEBUG=1
have() { command -v "$1" >/dev/null 2>&1; }
run_python() {
  if [ -n "${AGENTS_PYTHON:-}" ]; then "$AGENTS_PYTHON" "$@"; return $?; fi
  if command -v python3 >/dev/null 2>&1; then python3 "$@"; return $?; fi
  if command -v python >/dev/null 2>&1; then python "$@"; return $?; fi
  if command -v py >/dev/null 2>&1; then py -3 "$@"; return $?; fi
  return 127
}
lint_one() {
  [ -f "$1" ] || return 0
  case "$1" in
    *.py) have ruff && ruff check "$1" >&2 ;;
    *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs)
      have npx && npx --no-install eslint --version >/dev/null 2>&1 && npx --no-install eslint "$1" >&2 ;;
    *.sh) have shellcheck && shellcheck "$1" >&2 ;;
    *.pl|*.pm) have perl && perl -c "$1" >&2 ;;
  esac
  return 0
}

while IFS= read -r f; do
  [ -n "$f" ] && lint_one "$f"
done < <(run_python -c '
import sys,json,re
try:
    d=json.load(sys.stdin)
except Exception:
    sys.exit(0)
ti=d.get("tool_input") or d.get("input") or {}
ti=ti if isinstance(ti,dict) else {}
ps=[]
for k in ("file_path","path","filePath"):
    v=ti.get(k)
    if isinstance(v,str) and v: ps.append(v)
patch=ti.get("patch")
if isinstance(patch,str):
    ps+=re.findall(r"(?m)^\*\*\* (?:Update|Add) File: (.+)$", patch)
    ps+=re.findall(r"(?m)^\+\+\+ b/(.+)$", patch)
print("\n".join(dict.fromkeys(ps)))
' 2>/dev/null)
exit 0
