---
name: rule-format
description: How every rule in this library is written. Apply when authoring or editing any rule under rules/.
---

# rule-format — meta-rule

Defines the form of every other rule. A rule is an **entry point**: it states what to do
and in what order, and declares the chain (skills/agents/MCP) the map deploys. A rule
holds no project-specific values — those live in the project (see canon: self-configuration).

## File shape

- **Frontmatter** (required): `name` (kebab-case, matches the filename) and `description`.
  `description` is a **trigger**, not a label: "Apply when …", not "Helps with …".
  The agent reads it to decide whether to load the rule.
- **Body**: imperative and minimal. What to do, in what order. No prose padding.

## Markers

- `[CRITICAL]` — a hard constraint, no exceptions. Use only where a violation breaks
  correctness or security (e.g. never commit secrets). Overuse dilutes it.
- Positive instructions beat negative ones: prefer "do X" over "don't do Y". When a
  prohibition is essential, state it as `[CRITICAL]`.

## Structure for instruction-following

- Plain markdown sections are the default. They are readable and the agent follows them.
- For a rule with distinct instruction vs. output blocks, demarcate with tags
  (`<instructions>`, `<output_format>`) — models respect explicit boundaries. Optional;
  use it only when the structure genuinely helps, not as decoration.

## Role by task type

- Discriminative work (facts, classification, code, math) → neutral, no persona; a
  persona hurts factuality.
- Generative work (writing, styling, design) → a persona is allowed and improves alignment.

## Language

English — rules load into agent context, where English is cheaper and instruction-following
is marginally more reliable. Code, commands, paths, tool names stay as-is.

## Keep it thin

If removing a line would not make the agent err, remove it. A bloated rule buries the
part that matters (long context degrades attention). Before adding a NEW rule, check it is
not already covered by an existing one — a duplicate rule is bloat (this is the rule
counterpart of `skill-creator`; rules need no separate creator, just this discipline).
