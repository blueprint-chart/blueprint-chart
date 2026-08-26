/**
 * Color Vision Deficiency (CVD) simulation using Brettel/Viénot matrices.
 * Creates SVG `<filter>` elements with `<feColorMatrix>` for live preview,
 * and programmatic simulation for accessibility analysis.
 */

import chroma from 'chroma-js'

export type CvdType = 'protanopia' | 'deuteranopia' | 'tritanopia'

const CVD_LABELS: Record<CvdType, string> = {
  protanopia: 'Protanopia (no red)',
  deuteranopia: 'Deuteranopia (no green)',
  tritanopia: 'Tritanopia (no blue)',
}

/** Viénot simulation matrices (linearized sRGB). */
const CVD_MATRICES: Record<CvdType, number[]> = {
  protanopia: [
    0.152286, 1.052583, -0.204868, 0, 0,
    0.114503, 0.786281, 0.099216, 0, 0,
    -0.003882, -0.048116, 1.051998, 0, 0,
    0, 0, 0, 1, 0,
  ],
  deuteranopia: [
    0.367322, 0.860646, -0.227968, 0, 0,
    0.280085, 0.672501, 0.047413, 0, 0,
    -0.011820, 0.042940, 0.968881, 0, 0,
    0, 0, 0, 1, 0,
  ],
  tritanopia: [
    1.255528, -0.076749, -0.178779, 0, 0,
    -0.078411, 0.930809, 0.147602, 0, 0,
    0.004733, 0.691367, 0.303900, 0, 0,
    0, 0, 0, 1, 0,
  ],
}

/**
 * Returns the SVG filter element ID for a given CVD type.
 */
export function getCvdFilterId(type: CvdType): string {
  return `bc-cvd-${type}`
}

/**
 * Creates an SVG `<filter>` element with an `<feColorMatrix>` for the given CVD type.
 * The filter can be applied via CSS `filter: url(#<id>)`.
 */
export function createCvdSvgFilter(type: CvdType): SVGFilterElement {
  const ns = 'http://www.w3.org/2000/svg'
  const filter = document.createElementNS(ns, 'filter')
  filter.setAttribute('id', getCvdFilterId(type))
  filter.setAttribute('color-interpolation-filters', 'linearRGB')

  const matrix = document.createElementNS(ns, 'feColorMatrix')
  matrix.setAttribute('type', 'matrix')
  matrix.setAttribute('values', CVD_MATRICES[type].join(' '))
  filter.appendChild(matrix)

  return filter
}

/** sRGB gamma linearization. */
function toLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

/** sRGB gamma companding. */
function toSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
}

/**
 * Simulate how a color appears under a given CVD type.
 * Returns a hex string.
 */
export function simulateCvdColor(hex: string, type: CvdType): string {
  // An unparseable color paints as black in the browser; chroma() would throw
  // instead and take the whole caller down (charts/contrast.ts substitutes the
  // same way).
  const parsed = chroma.valid(hex) ? chroma(hex) : chroma('#000')
  const [r, g, b] = parsed.rgb().map(v => toLinear(v / 255))
  const m = CVD_MATRICES[type]
  const sr = toSrgb(m[0] * r + m[1] * g + m[2] * b)
  const sg = toSrgb(m[5] * r + m[6] * g + m[7] * b)
  const sb = toSrgb(m[10] * r + m[11] * g + m[12] * b)
  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v * 255)))
  return chroma(clamp(sr), clamp(sg), clamp(sb)).hex()
}

/** Minimum deltaE between simulated colors to consider them distinguishable. */
const MIN_CVD_DELTA_E = 10

export interface CvdIssue {
  type: CvdType
  label: string
  pairs: Array<{ a: string, b: string, deltaE: number }>
}

/**
 * Check an array of colors for distinguishability under each CVD type.
 * Returns issues only for types where at least one pair falls below the threshold.
 */
export function checkCvdColors(colors: string[]): CvdIssue[] {
  if (colors.length < 2) {
    return []
  }
  const types: CvdType[] = ['protanopia', 'deuteranopia', 'tritanopia']
  const issues: CvdIssue[] = []

  for (const type of types) {
    const simulated = colors.map(c => simulateCvdColor(c, type))
    const pairs: CvdIssue['pairs'] = []
    for (let i = 0; i < simulated.length; i++) {
      for (let j = i + 1; j < simulated.length; j++) {
        const de = chroma.deltaE(simulated[i], simulated[j])
        if (de < MIN_CVD_DELTA_E) {
          pairs.push({ a: colors[i], b: colors[j], deltaE: de })
        }
      }
    }
    if (pairs.length > 0) {
      issues.push({ type, label: CVD_LABELS[type], pairs })
    }
  }

  return issues
}
