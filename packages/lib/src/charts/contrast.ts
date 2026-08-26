import chroma from 'chroma-js'

/**
 * Safe wrapper around `chroma()` that returns a fallback when the input isn't
 * a valid CSS color. chroma-js otherwise throws `unknown format:` which would
 * propagate out of every entry point in this module.
 */
function safeChroma(color: string, fallback: chroma.Color): chroma.Color {
  if (!chroma.valid(color)) {
    return fallback
  }
  try {
    return chroma(color)
  }
  catch {
    return fallback
  }
}

/**
 * Returns '#fff' or '#333' — whichever has better contrast against `bg`.
 * Falls back to '#333' (readable on the default light background) when `bg`
 * isn't a valid color string.
 */
export function contrastTextColor(bg: string): string {
  if (!chroma.valid(bg)) {
    return '#333'
  }
  return chroma.contrast(bg, '#fff') >= chroma.contrast(bg, '#333') ? '#fff' : '#333'
}

/**
 * Compute WCAG 2.1 contrast ratio between two colors.
 * Returns a value between 1 and 21, or 1 (no contrast) when either input
 * isn't a valid color string.
 */
export function wcagContrastRatio(fg: string, bg: string): number {
  if (!chroma.valid(fg) || !chroma.valid(bg)) {
    return 1
  }
  return chroma.contrast(fg, bg)
}

/**
 * Determine WCAG conformance level from a contrast ratio.
 * AAA ≥ 7, AA ≥ 4.5, otherwise Fail.
 */
export function wcagLevel(ratio: number): 'AAA' | 'AA' | 'Fail' {
  if (ratio >= 7) {
    return 'AAA'
  }
  if (ratio >= 4.5) {
    return 'AA'
  }
  return 'Fail'
}

/** Minimum WCAG contrast ratio — targets AA (4.5) for text readability. */
const MIN_CONTRAST = 4.5

/**
 * Resolve the effective background color of an element by walking up the DOM.
 * Falls back to '#fff' when running outside a browser or when nothing is found.
 */
export function resolveBackgroundColor(el?: Element | null): string {
  let node = el
  while (node && node instanceof Element) {
    const bg = getComputedStyle(node).backgroundColor
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      return bg
    }
    node = node.parentElement
  }
  return '#fff'
}

/**
 * Ensures `color` is readable against `bg`.
 * Darkens or lightens the colour until the contrast ratio reaches MIN_CONTRAST.
 * `bg` can be a CSS color string; defaults to '#fff'.
 */
export function readableColor(color: string, bg: string = '#fff'): string {
  // Bail out on invalid input rather than letting chroma throw `unknown format:`.
  if (!chroma.valid(color)) {
    return chroma.valid(bg) ? contrastTextColor(bg) : '#333'
  }
  let c = chroma(color)
  const bgChroma = safeChroma(bg, chroma('#fff'))
  if (chroma.contrast(c, bgChroma) >= MIN_CONTRAST) {
    return c.hex()
  }

  // Decide direction: darken if bg is light, lighten if bg is dark
  const bgLight = bgChroma.luminance() > 0.5
  for (let i = 0; i < 20; i++) {
    c = bgLight ? c.darken(0.3) : c.brighten(0.3)
    if (chroma.contrast(c, bgChroma) >= MIN_CONTRAST) {
      break
    }
  }
  return c.hex()
}

/** Minimum perceptual distance (CIE2000 deltaE) between adjacent colors. */
const MIN_ADJACENT_DELTA_E = 12
const STEP = 0.25
const MAX_STEPS = 20
/** Hue rotation increment, in degrees, used once lightness steps are exhausted. */
const HUE_STEP = 15

/**
 * Adjusts an array of colors so that:
 * 1. Every color is readable against `bg` (WCAG contrast ratio >= MIN_CONTRAST).
 * 2. No color is perceptually close to any other (deltaE >= MIN_ADJACENT_DELTA_E).
 *
 * Lightness is changed first; hue rotates only when the lightness axis is
 * exhausted, so a palette whose entries share a hue still comes out distinct.
 */
export function adjustColorsForBackground(colors: string[], bg: string): string[] {
  if (colors.length === 0) {
    return []
  }

  // Default to white when `bg` is invalid so downstream chroma calls don't throw.
  const bgChroma = safeChroma(bg, chroma('#fff'))
  const safeBg = chroma.valid(bg) ? bg : '#fff'
  const bgLight = bgChroma.luminance() > 0.5

  // Pass 1 – ensure every color meets minimum contrast against the background.
  // Invalid color entries fall through unchanged (best-effort, no throw).
  const adjusted = colors.map((c) => {
    if (!chroma.valid(c)) {
      return chroma('#000')
    }
    return nudgeForBg(chroma(c), safeBg, bgLight)
  })

  // Pass 2 – push each color away from every color already placed. Comparing
  // only the immediate predecessor let pass 1 darken an entry onto a
  // non-adjacent one and merge two distinct series into a single color.
  for (let i = 1; i < adjusted.length; i++) {
    adjusted[i] = separateFrom(adjusted[i], adjusted.slice(0, i), safeBg, bgLight)
  }

  return adjusted.map(c => c.hex())
}

/** Darken or brighten `c` until it meets MIN_CONTRAST against `bg`. */
function nudgeForBg(c: chroma.Color, bg: string, bgLight: boolean): chroma.Color {
  for (let i = 0; i < MAX_STEPS; i++) {
    if (chroma.contrast(c, bg) >= MIN_CONTRAST) {
      return c
    }
    c = bgLight ? c.darken(STEP) : c.brighten(STEP)
  }
  return c
}

/** Smallest CIE2000 distance from `c` to any of the colors already placed. */
function minDeltaE(c: chroma.Color, placed: chroma.Color[]): number {
  return placed.reduce((min, p) => Math.min(min, chroma.deltaE(c, p)), Infinity)
}

/**
 * Candidate replacements for `c`, cheapest first: lightness steps in the
 * direction that preserves background contrast, then the opposite direction,
 * then hue rotations for when lightness is exhausted: two entries of the same
 * hue can be squeezed between a darker and a lighter neighbour with nowhere
 * left to go on the lightness axis.
 */
function* separationCandidates(c: chroma.Color, bgLight: boolean): Generator<chroma.Color> {
  for (const darken of [bgLight, !bgLight]) {
    let candidate = c
    for (let i = 0; i < MAX_STEPS; i++) {
      candidate = darken ? candidate.darken(STEP) : candidate.brighten(STEP)
      yield candidate
    }
  }
  for (let deg = HUE_STEP; deg <= 180; deg += HUE_STEP) {
    yield c.set('hsl.h', `+${deg}`)
    yield c.set('hsl.h', `-${deg}`)
  }
}

/**
 * Move `c` until it clears MIN_ADJACENT_DELTA_E against every color in
 * `placed`, keeping the furthest candidate found when nothing clears it. `c`
 * itself is the baseline, so the result is never closer than the input.
 */
function separateFrom(
  c: chroma.Color,
  placed: chroma.Color[],
  bg: string,
  bgLight: boolean,
): chroma.Color {
  let best = c
  let bestDist = minDeltaE(c, placed)
  if (bestDist >= MIN_ADJACENT_DELTA_E) {
    return c
  }
  for (const candidate of separationCandidates(c, bgLight)) {
    if (chroma.contrast(candidate, bg) < MIN_CONTRAST) {
      continue
    }
    const dist = minDeltaE(candidate, placed)
    if (dist > bestDist) {
      best = candidate
      bestDist = dist
    }
    if (bestDist >= MIN_ADJACENT_DELTA_E) {
      break
    }
  }
  return best
}
