---
name: code-search
description: Escalate grep -> LSP -> structural index (cheapest that answers). Apply when searching a codebase for symbols, callers, or impact.
---

# code-search

Agents grep by habit and full-scan the tree (hundreds of K tokens, dozens of tool calls). Escalate
deliberately — the cheapest tool that answers the question:

1. **Small repo / no index → `rg`/grep.** Do not add anything without measured pain.
2. **Symbol/type-aware need** (who-calls, references, rename impact) in a typed language → the **LSP
   tool** (a language server via the project's `tsconfig`/config): **zero-setup**, exact, and the
   right step **before** a structural index. Prefer it over standing up CodeGraph.
   - **On Claude, this tier is native.** A code-intelligence plugin (`pyright-lsp`, `typescript-lsp`,
     `gopls-lsp`, … from the official marketplace) wires the language server to Claude's built-in LSP
     tool: **automatic diagnostics after every edit** (type errors / bad imports surfaced and fixed in
     the same turn) + navigation (def / refs / hover / call-hierarchy). Needs the language-server
     **binary** on PATH (`pyright-langserver`, `typescript-language-server`, `gopls`, …). Treat like
     playwright: **per-agent, install-when-needed** — the agent that runs installs its own LSP layer
     (Claude the plugin; codex/opencode bring their own LSP); log it in `./.agents/REGISTRY.md`.
3. **Measured grep-scan pain, cross-repo, or LSP too narrow** → a **structural index** (CodeGraph
   light/local by default; Gortex for multi-repo). Regenerable cache (`.codegraph/` or equivalent) —
   gitignored, never committed; a local SQLite DB → keep on a **local filesystem** (avoid network /
   cross-OS mounts → SQLite lock errors); the agent places it for its own environment.

If an index already exists (a CodeGraph/Gortex MCP), use structural search (who-calls, what-breaks,
symbol lookup) instead of grep. A structural index is project-level (self-config), recorded in
`./.agents/REGISTRY.md`. Note: a **template-literal / bundled blob is opaque** to a structural indexer
(it sees a string, not an AST) — grep the string there, an index won't help.
