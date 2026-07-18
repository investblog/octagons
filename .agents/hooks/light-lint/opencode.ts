// opencode light-lint plugin. Install into ./.opencode/plugin/light-lint.ts
// Non-blocking: lints the just-edited file by extension, never throws.
import type { Plugin } from "@opencode-ai/plugin"

export const LightLint: Plugin = async ({ $ }) => ({
  "tool.execute.after": async (input, output) => {
    if (!["edit", "write"].includes(input.tool)) return
    const a = (output && (output as { args?: Record<string, unknown> }).args) || {}
    const p = (a.filePath || a.path) as string | undefined
    if (typeof p !== "string" || !p) return
    if (p.endsWith(".py")) await $`ruff check ${p}`.quiet().nothrow()
    else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(p)) await $`npx --no-install eslint ${p}`.quiet().nothrow()
    else if (p.endsWith(".sh")) await $`shellcheck ${p}`.quiet().nothrow()
    else if (/\.(pl|pm)$/.test(p)) await $`perl -c ${p}`.quiet().nothrow()
  },
})
