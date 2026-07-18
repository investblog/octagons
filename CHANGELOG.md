# Changelog

## 0.1.2 — 2026-07-19

Fixes found by review of the 0.1.1 offline-rendering recipe. The first one made that
recipe produce unusable footage, so this supersedes 0.1.1 for any video work.

### Fixed
- **`set({ seed })` did nothing** — `seed` was missing from the switch, so re-seeding a
  running instance was silently ignored. It now rebuilds the field, and does so
  identically to a fresh `init()` with that seed (verified: byte-identical canvases).
- **The alpha recipe baked a vignette into the alpha channel.** With `background: null`
  the canvas is cleared to transparent, but `paintVignette()` then filled black at
  partial alpha across it. Measured: the corner pixel came out at alpha 79/255 — a 31%
  black wash that composites over whatever the clip is laid on. The documented recipe now
  sets `vignette: 0`, which belongs with `background: null`.

### Docs
- README states that `step()` bypasses the off-screen/hidden-tab sleeping described under
  Performance. Headless pages are usually `document.hidden`, so that section otherwise
  reads as a warning against the very thing offline rendering does.
- Playwright screenshots need `omitBackground: true`, or a transparent canvas still comes
  out on opaque white. PNG only.
- `seed` marked as settable live.

## 0.1.1 — 2026-07-19

Adds what offline/video rendering needs. No breaking changes; defaults are unchanged.

### Added
- **`seed`** option — routes the field's scatter through a seeded PRNG (mulberry32).
  Same seed plus the same `dt` sequence produces byte-identical frames. Without a seed
  the behaviour is exactly as before: different on every load.
- **`step(dt)`** — draws one frame advanced by exactly `dt`, off the
  `requestAnimationFrame` clock, so a renderer can drive the animation on its own timing.

### Fixed
- The field re-scattered octagons through `Math.random` when they passed the camera, so
  an unseeded run diverged *during* the animation rather than only at start-up. Both the
  initial scatter and the respawn now share one seeded stream.

### Docs
- Offline rendering section: the Playwright/ffmpeg recipe, ProRes 4444 for alpha, and an
  honest account of what each Adobe target actually needs — ExtendScript is ES3 with no
  canvas, so that is a rewrite rather than a port.
- Credits to 301ST and generator.ink.
- npm keywords widened from 7 to 16 for search.

### Notes
- Published **without provenance**: the tagged OIDC release signed its attestation but
  the registry refused the upload (404 on PUT, npm's masking of 403), because no trusted
  publisher is configured for the package yet. Fell back to the one-time token workflow.
  Provenance arrives with the first release after that setup.
- `step(dt)`, not `render(absoluteTime)`: field motion is integrated and respawn
  re-randomises position, so there is no closed form to seek to. Frames must be produced
  in order; a clip cannot be split across parallel workers.

## 0.1.0 — 2026-07-18

First release. Two modes — `field` (regular octagons drifting through depth) and
`lattice` (the 4.8.8 truncated-square tiling with optional bonding) — plus `pattern()`,
which returns the lattice as a seamless repeating SVG for use as a plain
`background-image`.

Published without provenance: npm has no package page to configure a trusted publisher
on until the package exists, so the first release went out through a one-time token.
