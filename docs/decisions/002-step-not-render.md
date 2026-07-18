---
type: decision
status: active
tags: [api, rendering]
project: octagons
---

# 002 — `step(dt)` rather than `render(absoluteTime)`

## Context

Offline rendering (PNG sequence → ffmpeg → editor) needs two things the library lacked:
an external clock, and reproducibility. The proposal that raised it asked for
`og.render(t)` — draw the frame at absolute time `t`.

## Decision

Expose `step(dt)`: advance by exactly `dt` and draw. Frames are produced in order.

## Why not absolute time

Field motion is **integrated, not evaluated**. Depth decreases per frame (`o.z -= dt * …`)
and an octagon that passes the camera is re-scattered to a new x/y. There is no closed
form to seek to, so `render(t)` cannot be implemented by jumping — it would have to
replay from zero anyway.

Making it genuinely seekable is possible: derive the respawn position from a hash of the
wrap count instead of drawing fresh randomness, and depth and rotation both become pure
functions of `t`. That is worth doing **only if** out-of-order or parallel rendering is
needed. It is not needed for a sequence render, which is inherently sequential.

## Consequences

- A clip cannot be split across parallel workers, and second 37 cannot be reached without
  rendering the first 37. Stated plainly in the README rather than discovered.
- `step()` deliberately bypasses the off-screen and hidden-tab gating, calling `frame()`
  directly. Headless pages are usually `document.hidden`, so routing it through the gate
  would have made offline rendering silently produce nothing.
- Reproducibility is a separate axis, handled by `seed` (mulberry32). Both the initial
  scatter and the respawn draw from that one stream — the respawn matters more, because
  unseeded runs diverge *during* the animation, not only at frame 0.
