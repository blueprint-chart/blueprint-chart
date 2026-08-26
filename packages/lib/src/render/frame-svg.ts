import type { FrameOptions } from '../charts/types'
import { expandPaddingShorthand } from '../charts/frame/frame'

export interface FrameSvgTextBlock {
  text: string
  x: number
  y: number
  fontSize: number
  fontWeight?: string
  fontStyle?: string
  fontFamily?: string
  fill?: string
  anchor?: 'start' | 'middle' | 'end'
}

export interface FrameSvgPlot {
  x: number
  y: number
  width: number
  height: number
}

export interface FrameSvgLayout {
  width: number
  height: number
  plot: FrameSvgPlot
  blocks: FrameSvgTextBlock[]
  background: string | null
  color: string
  fontFamily: string
}

export interface FrameTheme {
  background: string
  color: string
}

export interface FrameSvgLayoutOptions {
  width: number
  height: number
  frame?: FrameOptions | null
  theme?: string
}

const LIGHT_THEME: FrameTheme = { background: '#ffffff', color: '#333333' }
// Mirrors the `[data-bs-theme="dark"] .bc-frame` block in runtime/chart-css.ts,
// which is what a browser resolves for the same theme.
const DARK_THEME: FrameTheme = { background: '#1c1c1c', color: 'rgba(255, 255, 255, 0.9)' }

const FONT_FAMILY = 'sans-serif'
const TITLE_FONT_SIZE = 20
const DESCRIPTION_FONT_SIZE = 14
const META_FONT_SIZE = 12
const LINE_HEIGHT = 1.25
const DESCRIPTION_MARGIN_TOP = 4
const FOOTER_MARGIN_TOP = 8
const FOOTER_GAP = 12
const MIN_PLOT_HEIGHT = 40
const DEFAULT_PADDING = '16px'
const CREDIT_TEXT = 'Blueprint Chart'
const SOURCE_PREFIX = 'Source: '
const FOOTER_SEPARATOR = ' · '
const FALLBACK_CHAR_RATIO = 0.6

export function resolveFrameTheme(theme?: string): FrameTheme {
  return theme === 'dark' ? { ...DARK_THEME } : { ...LIGHT_THEME }
}

type Measurer = (text: string, fontSize: number, bold: boolean) => number

function measureContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') {
    return null
  }
  try {
    return document.createElement('canvas').getContext('2d')
  }
  catch {
    return null
  }
}

/**
 * `measureText` under-reports the real glyph advance, and the font bundled for
 * headless rendering has no CJK coverage, so a per-character floor keeps a long
 * headline from overflowing the frame instead of wrapping.
 */
function createMeasurer(): Measurer {
  const ctx = measureContext()
  return (text, fontSize, bold) => {
    const floor = text.length * fontSize * FALLBACK_CHAR_RATIO
    if (!ctx) {
      return floor
    }
    ctx.font = `${bold ? 'bold ' : ''}${fontSize}px ${FONT_FAMILY}`
    return Math.max(ctx.measureText(text).width, floor)
  }
}

function wrapText(text: string, maxWidth: number, fontSize: number, bold: boolean, measure: Measurer): string[] {
  const lines: string[] = []
  // The frame stylesheet sets `white-space: pre-line`, so explicit breaks hold.
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      continue
    }
    let line = words[0]
    for (const word of words.slice(1)) {
      const candidate = `${line} ${word}`
      if (measure(candidate, fontSize, bold) <= maxWidth) {
        line = candidate
      }
      else {
        lines.push(line)
        line = word
      }
    }
    lines.push(line)
  }
  return lines
}

interface LineStyle {
  x: number
  top: number
  fontSize: number
  fill: string
  fontWeight?: string
  fontStyle?: string
  anchor?: 'start' | 'middle' | 'end'
}

/** Appends one text block per line and returns the top of the next line box. */
function pushLines(blocks: FrameSvgTextBlock[], lines: string[], style: LineStyle): number {
  let top = style.top
  for (const line of lines) {
    blocks.push({
      text: line,
      x: style.x,
      y: top + style.fontSize,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      fill: style.fill,
      anchor: style.anchor,
    })
    top += style.fontSize * LINE_HEIGHT
  }
  return top
}

function toPx(value: string): number {
  const size = parseFloat(value) || 0
  return /r?em$/.test(value) ? size * 16 : size
}

/**
 * Lay the frame chrome out in SVG user units and reserve what is left for the
 * plot. The caller renders the chart at `plot.width` x `plot.height` and hands
 * the markup back to `buildFrameSvg`.
 */
export function layoutFrameSvg(opts: FrameSvgLayoutOptions): FrameSvgLayout {
  const frame = opts.frame ?? {}
  const theme = resolveFrameTheme(opts.theme)
  const [padTop, padRight, padBottom, padLeft] = expandPaddingShorthand(frame.padding ?? DEFAULT_PADDING).map(toPx)
  const innerWidth = Math.max(opts.width - padLeft - padRight, 1)
  const measure = createMeasurer()
  const blocks: FrameSvgTextBlock[] = []

  let top = padTop
  if (frame.title) {
    top = pushLines(blocks, wrapText(frame.title, innerWidth, TITLE_FONT_SIZE, true, measure), {
      x: padLeft,
      top,
      fontSize: TITLE_FONT_SIZE,
      fontWeight: 'bold',
      fill: theme.color,
    })
  }
  if (frame.description) {
    top = pushLines(blocks, wrapText(frame.description, innerWidth, DESCRIPTION_FONT_SIZE, false, measure), {
      x: padLeft,
      top: frame.title ? top + DESCRIPTION_MARGIN_TOP : top,
      fontSize: DESCRIPTION_FONT_SIZE,
      fill: theme.color,
    })
  }
  const headerBottom = top

  const noteLines = frame.note ? wrapText(frame.note, innerWidth, META_FONT_SIZE, false, measure) : []
  const creditWidth = measure(CREDIT_TEXT, META_FONT_SIZE, false)
  const footerText = [
    frame.byline,
    frame.source ? SOURCE_PREFIX + frame.source : '',
  ].filter(Boolean).join(FOOTER_SEPARATOR)
  const footerLines = footerText
    ? wrapText(footerText, Math.max(innerWidth - creditWidth - FOOTER_GAP, 1), META_FONT_SIZE, false, measure)
    : []
  const footerRows = Math.max(footerLines.length, 1)
  const chromeBottom = noteLines.length * META_FONT_SIZE * LINE_HEIGHT
    + FOOTER_MARGIN_TOP + footerRows * META_FONT_SIZE * LINE_HEIGHT
    + padBottom

  // A pathologically tall header must still leave a visible plot: an empty
  // chart area is worse output than chrome that overlaps.
  const plotHeight = Math.max(opts.height - headerBottom - chromeBottom, MIN_PLOT_HEIGHT)

  let bottom = headerBottom + plotHeight
  bottom = pushLines(blocks, noteLines, {
    x: padLeft,
    top: bottom,
    fontSize: META_FONT_SIZE,
    fontStyle: 'italic',
    fill: theme.color,
  }) + FOOTER_MARGIN_TOP
  pushLines(blocks, footerLines, {
    x: padLeft,
    top: bottom,
    fontSize: META_FONT_SIZE,
    fill: theme.color,
  })
  pushLines(blocks, [CREDIT_TEXT], {
    x: opts.width - padRight,
    top: bottom,
    fontSize: META_FONT_SIZE,
    fontWeight: '600',
    fill: theme.color,
    anchor: 'end',
  })

  return {
    width: opts.width,
    height: opts.height,
    plot: { x: padLeft, y: headerBottom, width: innerWidth, height: plotHeight },
    blocks,
    background: frame.transparentBackground ? null : theme.background,
    color: theme.color,
    fontFamily: FONT_FAMILY,
  }
}

function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttribute(value: string): string {
  return escapeText(value).replace(/"/g, '&quot;')
}

function renderTextBlock(block: FrameSvgTextBlock, layout: FrameSvgLayout): string {
  return [
    `<text x="${block.x}" y="${block.y}" font-size="${block.fontSize}px"`,
    block.fontFamily ? ` font-family="${escapeAttribute(block.fontFamily)}"` : '',
    block.fontWeight ? ` font-weight="${escapeAttribute(block.fontWeight)}"` : '',
    block.fontStyle ? ` font-style="${escapeAttribute(block.fontStyle)}"` : '',
    block.anchor ? ` text-anchor="${block.anchor}"` : '',
    ` fill="${escapeAttribute(block.fill ?? layout.color)}">`,
    escapeText(block.text),
    '</text>',
  ].join('')
}

/**
 * Compose the frame chrome and a rendered plot into one standalone SVG. The
 * chrome is native `<text>`, so the result survives rasterization and a bare
 * `.svg` file with no stylesheet.
 */
export function buildFrameSvg(layout: FrameSvgLayout, plotSvg: string): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}"`,
    ` viewBox="0 0 ${layout.width} ${layout.height}"`,
    ` font-family="${escapeAttribute(layout.fontFamily)}" color="${escapeAttribute(layout.color)}">`,
    layout.background ? `<rect width="100%" height="100%" fill="${escapeAttribute(layout.background)}"></rect>` : '',
    ...layout.blocks.map(block => renderTextBlock(block, layout)),
    `<g transform="translate(${layout.plot.x},${layout.plot.y})">${plotSvg}</g>`,
    '</svg>',
  ].join('')
}
