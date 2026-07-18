---
type: decision
status: active
tags: [geometry, visual]
project: octagons
---

# 001 — Draw edges, never fill them

## Context

A regular octagon cannot tile the plane. Interior angle 135°, and 360/135 is not a whole
number. The stronger result is unconditional: no strictly convex polygon with seven or
more sides tiles at all (Reinhardt 1918; Niven 1978, the clean modern proof).

So an octagonal field has to give something up. The alternatives were checked, not
assumed:

- **Non-convex octagons that tile alone** exist, but the angle budget is 1080° and at
  least one vertex must be reflex, so the remaining seven average under 128.6°. An
  optimisation run looking for the most octagon-like tiling octagon converged on a
  regular hexagon wearing two fake 180° vertices. They never read as octagons.
- **Voronoi cells** average exactly six sides at every jitter strength, and for Poisson
  too — forced by Euler, verified numerically across six jitter levels. Never eight.
- **Octagon + square filler** (the 4.8.8 truncated square tiling) keeps the octagon
  exactly regular, at the cost of a 45°-rotated square at each node.

4.8.8 was therefore the only route that preserves the shape. But filled, it looked wrong:
the leftover square reads as a *hole*, and the whole field reads as a bathroom floor.
Design research independently reached the same place — the brands that own an octagon
(Chase, Bulgari, Chanel) deliberately never tile it.

## Decision

Render outlines only. The colour gradient runs *along* the edges; nothing is ever filled.

## Consequences

- The leftover square stops being a hole and becomes a node.
- **Exact tiling stops being a requirement.** Invisible gaps mean shapes no longer have
  to meet perfectly — which is what allows both the node octagons (`nodes: 'octagon'`)
  and the random bonding of neighbours (`bond`). Neither produces an exact tiling and
  neither needs to.
- The theorem above stops constraining the design at all: it is about filling the plane,
  and the plane is no longer being filled.
- Cost: line art has no hidden-surface removal. Any 3D or extruded mode must cull edges
  facing away from the vanishing point, or support struts show as scratches.
