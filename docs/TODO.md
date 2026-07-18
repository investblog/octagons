---
type: note
status: active
tags: [backlog]
project: octagons-lite
---

# Backlog

The single list of open work. Items link to plans in `../.agents/plans/active/` once one
exists; an item is dropped when its plan moves to `plans/done/`.

## Blocking publication

- **Confirm the package name.** `octagons-lite` is a working assumption, never approved.
- **Confirm the license and add a `LICENSE` file.** `package.json` says MIT to match
  `trigons-lite`, but no license file exists and the licensing discussion was deferred.
  `"private": true` currently prevents accidental publish.
- **Decide `author` / `repository`.** Deliberately omitted rather than guessed.
- **Sponsor attribution.** If the oktagonbet credit ships, keep it to one line + one link
  to a corporate page, and keep it out of `keywords`/description — density is what reads
  as spam. Note GitHub applies `rel="nofollow"` to README links, so there is no SEO gain.
- **Wire the build into publish.** `octagons-lite.min.js` is **gitignored** — the
  `git-discipline` rule forbids committing generated artifacts, so unlike `trigons-lite`
  (which commits its minified file and can ship a stale one) it is never in the repo.
  But `package.json` `files` still lists it, so publishing without building would ship a
  broken package. Add a `prepublishOnly` build script before the first publish.
  Current size: 6 950 B minified, **3 180 B gzipped**, from 15 599 B of source.

## Known issues

- **No tests.** `demo.html` is manual-only, so the push gate has nothing to run. Open
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
