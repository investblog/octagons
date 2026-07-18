---
type: note
status: active
tags: [backlog]
project: octagons
---

# Backlog

The single list of open work. Items link to plans in `../.agents/plans/active/` once one
exists; an item is dropped when its plan moves to `plans/done/`.

## Notes

- Credits deliberately differ by surface and that is correct: the README credits 301ST
  and generator.ink (generator.ink is a 301 project), the demo panel credits
  "Made in 301 · for oktagon.bet". Not a discrepancy — leave both.

## Open

- **Trusted Publisher is still not configured**, three releases in. 0.1.0, 0.1.1 and
  0.1.2 all went out through the token bootstrap, so none carry provenance, every tag
  leaves a failed `release.yml` run behind, and the `NPM_TOKEN` secret is still sitting
  in the repository. Full steps in [decisions/003](decisions/003-publishing-over-oidc.md).
  This is the one open item that costs something every release.
- **Delete `bootstrap-publish.yml`** once the above works — it stops functioning anyway
  if token publishing is disallowed.
- **No tests, and now an API that wants them.** `seed` + `step(dt)` make the field
  deterministic, which means a headless frame-hash test is finally possible: render N
  frames at a fixed seed, compare a hash against a stored value. That would have caught
  the `set({ seed })` no-op automatically.
- **CDN eligibility.** cdnjs wants roughly 800 npm downloads/month or 200 GitHub stars;
  jsDelivr and unpkg serve from npm with no threshold and already work.

## Known issues

- **No tests.** `index.html` is manual-only, so the push gate has nothing to run. Open
  question whether that is acceptable at this size.

### Resolved

- **fps measured cleanly: 60.** Both the demo (three instances, one visible) and an
  isolated lattice hold a steady 59–61 fps in a single clean tab.
- **The "lattice hang" did not exist.** It was measurement contamination — several
  leftover tabs each animating a full-screen canvas, one of them wedged. The same build
  reads 60 fps once they are closed. No library fix was needed; see the measurement rule
  in `../AGENTS.md`.

## Ideas, not scheduled

- `field` clumps toward the centre — far octagons converge on the vanishing point.
  Fix by seeding in a cone rather than a box, or pushing outward on respawn.
- Optionally snap octagon rotation to 45° steps for a stricter, more brand-like field.
- Vortex/rings mode existed in the prototypes and looked striking, but reads as a hero
  element rather than a background. Not ported.
