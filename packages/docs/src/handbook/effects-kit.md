---
title: Effects Kit
---

# Effects Kit

> The brand effects kit ported from FIG.07 of the effects kit reference: one law, the ALWAYS / NEVER rules (including the rejected variants), and how each effect maps to a real class or component in `@blueprint-chart/ui`.

## The law

Ink and light condense around a point of attention. Everything below is that sentence, enforced.

## ALWAYS

- Give every grid pool, grain bloom, and gradient an anchor, a data point, cursor, or CTA.
- On paper, any chartreuse focus dot wears a 2px navy ring, a miniature of the two-circle logo.
- Keep chartreuse at roughly 4% of any composition, it marks decisions and data, nothing else.
- Keep inner card edges crisp; texture lives in the ring and the bloom.
- Use identical grid cell size (20px) and line weight (1px) in both modes.
- Treat gradients on dark as particle-density ramps, two seeds, optical mixing.

## NEVER, including the rejected variants

- Full-bleed or uniform grid on any surface (rejected: "the clearing", generic SaaS grid).
- Thin chartreuse strokes or chartreuse text on white.
- Grain on charts, data, text zones, app UI, or any light surface.
- Gradient "drawn line" strokes and sprayed particle shadows (rejected rev 02).
- Visible start/end gaps in perimeter borders (rejected: pen-lift perimeter).
- Stencil overspray borders (rejected).
- Chartreuse in the static logo, nav, or ordinary structure.
- More than one particle ring or one chartreuse CTA per view.

## Effects and their classes

- **Grid pool** (`.bc-pool`): the drafting grid revealed radially around an anchor via a mask, never full-bleed; set `--bc-pool-x` / `--bc-pool-y` to place it over the anchor.
- **Pen & highlighter** (`--bc-mark`, `.bc-highlight`): the one marker with two gestures, chartreuse ink on dark, a chartreuse swipe behind body ink on light.
- **Grain** (`StippleDefs`): the shared stipple filter defs, referenced by `filter: url(#bc-stipple-a|b|c)`; dark marketing surfaces only (the landing hero), never on charts, data, or app UI.
- **Particle ring** (`.bc-ring`): a stippled gradient stroke framing one featured element per view; inner edges stay crisp, ordinary cards keep flat hairlines instead.
- **Buttons** (`.btn-bc-primary`): the everyday emphasis button, chartreuse fill / navy ink (navy fill / chartreuse ink on light); its hover/focus state is the pooled `.bc-pool`, not a separate button.

## See also

- [Color & Palettes](/handbook/color)
- [Design Principles](/handbook/design-principles)
- [Anti-Patterns](/handbook/anti-patterns)
