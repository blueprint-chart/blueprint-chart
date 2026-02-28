import chroma from 'chroma-js'

/**
 * Returns '#fff' or '#333' — whichever has better contrast against `bg`.
 */
export function contrastTextColor(bg: string): string {
  return chroma.contrast(bg, '#fff') >= chroma.contrast(bg, '#333') ? '#fff' : '#333'
}

/**
 * Compute WCAG 2.1 contrast ratio between two colors.
 * Returns a value between 1 and 21.
 */
export function wcagContrastRatio(fg: string, bg: string): number {
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
  let c = chroma(color)
  if (chroma.contrast(c, bg) >= MIN_CONTRAST) {
    return c.hex()
  }

  // Decide direction: darken if bg is light, lighten if bg is dark
  const bgLight = chroma(bg).luminance() > 0.5
  for (let i = 0; i < 20; i++) {
    c = bgLight ? c.darken(0.3) : c.brighten(0.3)
    if (chroma.contrast(c, bg) >= MIN_CONTRAST) {
      break
    }
  }
  return c.hex()
}

/** Minimum perceptual distance (CIE2000 deltaE) between adjacent colors. */
const MIN_ADJACENT_DELTA_E = 12
const STEP = 0.25
const MAX_STEPS = 20

/**
 * Adjusts an array of colors so that:
 * 1. Every color is readable against `bg` (WCAG contrast ratio >= 3).
 * 2. Adjacent colors are perceptually distinguishable (deltaE >= 12).
 *
 * Only lightness is changed — hue and saturation are preserved.
 */
export function adjustColorsForBackground(colors: string[], bg: string): string[] {
  if (colors.length === 0) {
    return []
  }

  const bgLight = chroma(bg).luminance() > 0.5

  // Pass 1 – ensure every color meets minimum contrast against the background
  const adjusted = colors.map(c => nudgeForBg(chroma(c), bg, bgLight))

  // Pass 2 – nudge adjacent colors apart when they are too similar
  for (let i = 1; i < adjusted.length; i++) {
    if (chroma.deltaE(adjusted[i], adjusted[i - 1]) >= MIN_ADJACENT_DELTA_E) {
      continue
    }
    adjusted[i] = nudgeApart(adjusted[i], adjusted[i - 1], bg, bgLight)
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

/**
 * Push `c` away from `neighbor` by darkening or brightening.
 * Tries the primary direction first (darken on light bg, brighten on dark bg)
 * since that preserves background contrast. Falls back to the opposite
 * direction when the primary one doesn't achieve enough separation.
 */
function nudgeApart(
  c: chroma.Color,
  neighbor: chroma.Color,
  bg: string,
  bgLight: boolean,
): chroma.Color {
  const primary = tryNudgeApart(c, neighbor, bg, bgLight)
  if (chroma.deltaE(primary, neighbor) >= MIN_ADJACENT_DELTA_E) {
    return primary
  }

  const opposite = tryNudgeApart(c, neighbor, bg, !bgLight)
  if (
    chroma.deltaE(opposite, neighbor) > chroma.deltaE(primary, neighbor)
    && chroma.contrast(opposite, bg) >= MIN_CONTRAST
  ) {
    return opposite
  }
  return primary
}

function tryNudgeApart(
  c: chroma.Color,
  neighbor: chroma.Color,
  bg: string,
  darken: boolean,
): chroma.Color {
  let best = c
  let bestDist = chroma.deltaE(c, neighbor)
  let candidate = c

  for (let i = 0; i < MAX_STEPS; i++) {
    candidate = darken ? candidate.darken(STEP) : candidate.brighten(STEP)
    const dist = chroma.deltaE(candidate, neighbor)
    if (dist > bestDist && chroma.contrast(candidate, bg) >= MIN_CONTRAST) {
      best = candidate
      bestDist = dist
    }
    if (bestDist >= MIN_ADJACENT_DELTA_E) {
      break
    }
  }

  return best
}
