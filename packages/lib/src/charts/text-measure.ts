/**
 * Shared text measurement for the layout estimators: axis tick density, legend
 * item advance, arc label margins and annotation wrapping all need to know how
 * wide a string will actually render.
 *
 * Three sources, first available wins:
 * 1. an offscreen 2D canvas — the browser and the editor;
 * 2. a detached SVG `<text>` and `getComputedTextLength()` — what the Node
 *    backend has, through the jsdom shim in `render/backends/text-shim.ts`;
 * 3. the per-glyph estimate below, when a render environment offers neither.
 *
 * The result is never below the estimate. The font the Node backend bundles
 * (DejaVu Sans) has no CJK glyphs, so measuring Japanese text there returns the
 * width of the notdef box (~0.6em) rather than the ~1em a CJK face advances;
 * without the floor, wide scripts would be under-reserved headlessly.
 */

const SVG_NS = 'http://www.w3.org/2000/svg'

// East Asian Wide and Fullwidth ranges: one glyph advances a full em.
const WIDE_GLYPH = /[\u1100-\u115f\u2e80-\ua4cf\ua960-\ua97f\uac00-\ud7a3\uf900-\ufaff\ufe10-\ufe19\ufe30-\ufe6f\uff00-\uff60\uffe0-\uffe6]/
const WIDE_EM = 1
// Lower bound for a Latin/Cyrillic glyph; the real average is nearer 0.55em.
const NARROW_EM = 0.5

let cachedContext: CanvasRenderingContext2D | null = null
// The Node backend swaps `document` per render, so the cached context has to be
// invalidated when the document it came from is gone.
let cachedContextDocument: Document | null = null

function estimateWidth(text: string, fontSizePx: number): number {
  let em = 0
  for (const char of text) {
    em += WIDE_GLYPH.test(char) ? WIDE_EM : NARROW_EM
  }
  return em * fontSizePx
}

function canvasContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') {
    return null
  }
  if (cachedContextDocument !== document) {
    cachedContextDocument = document
    try {
      cachedContext = document.createElement('canvas').getContext('2d')
    }
    catch {
      cachedContext = null
    }
  }
  return cachedContext
}

function canvasWidth(text: string, fontSizePx: number): number | null {
  const ctx = canvasContext()
  if (!ctx) {
    return null
  }
  ctx.font = `${fontSizePx}px sans-serif`
  const width = ctx.measureText(text).width
  return width > 0 ? width : null
}

function svgTextWidth(text: string, fontSizePx: number): number | null {
  if (typeof document === 'undefined' || typeof document.createElementNS !== 'function') {
    return null
  }
  const svg = document.createElementNS(SVG_NS, 'svg')
  const node = document.createElementNS(SVG_NS, 'text') as SVGTextContentElement
  node.setAttribute('font-size', String(fontSizePx))
  node.textContent = text
  svg.appendChild(node)
  if (typeof node.getComputedTextLength !== 'function') {
    return null
  }
  // A detached node has no layout in a real browser, which reports 0.
  const width = node.getComputedTextLength()
  return width > 0 ? width : null
}

/** Rendered width of `text` in px at `fontSizePx`, in the chart font. */
export function measureTextWidth(text: string, fontSizePx: number): number {
  if (text === '') {
    return 0
  }
  const measured = canvasWidth(text, fontSizePx) ?? svgTextWidth(text, fontSizePx) ?? 0
  return Math.max(measured, estimateWidth(text, fontSizePx))
}

/** Rendered width of the widest of `texts`, or 0 when there are none. */
export function measureMaxTextWidth(texts: string[], fontSizePx: number): number {
  let max = 0
  for (const text of texts) {
    const width = measureTextWidth(text, fontSizePx)
    if (width > max) {
      max = width
    }
  }
  return max
}

/**
 * Longest prefix of `text` that fits in `maxWidth`, with `suffix` appended when
 * anything had to be dropped. Returns `text` unchanged when it already fits.
 */
export function truncateToWidth(text: string, maxWidth: number, fontSizePx: number, suffix = '…'): string {
  if (measureTextWidth(text, fontSizePx) <= maxWidth) {
    return text
  }
  const chars = [...text]
  const suffixWidth = measureTextWidth(suffix, fontSizePx)
  let kept = chars.length
  while (kept > 1 && measureTextWidth(chars.slice(0, kept).join(''), fontSizePx) + suffixWidth > maxWidth) {
    kept--
  }
  return chars.slice(0, kept).join('') + suffix
}
