// opencode secrets-guard plugin. Install into ./.opencode/plugin/secrets-guard.ts
// Blocks read/edit/write (and shell commands) that touch a secret file.
// *.example/.sample/.template are allowed (templates).
import type { Plugin } from "@opencode-ai/plugin"

const SAFE = new Set(["example", "sample", "template"])

function isSecret(name: string): boolean {
  const base = (name.split("/").pop() || "").toLowerCase()
  if ([".secrets", ".dev.vars", ".env"].includes(base)) return true
  if (base.endsWith(".pem")) return true
  if (base.startsWith("id_rsa") || base.startsWith("id_ed25519")) return true
  if (base.startsWith(".env.") && !SAFE.has(base.split(".").pop() || "")) return true
  return false
}

export const SecretsGuard: Plugin = async () => ({
  "tool.execute.before": async (_input, output) => {
    const a = (output && (output as { args?: Record<string, unknown> }).args) || {}
    const text = ["filePath", "path", "command", "patch"]
      .map((k) => (typeof a[k] === "string" ? (a[k] as string) : ""))
      .join(" ")
    const tokens = text.match(/[\w./-]+/g) || []
    if (tokens.some(isSecret)) {
      throw new Error("secrets-guard: blocked access to a secret file (see the secrets rule)")
    }
  },
})
