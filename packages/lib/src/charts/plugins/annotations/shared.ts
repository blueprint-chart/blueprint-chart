import * as d3 from 'd3'
import { RangeAnchor } from '../../types'
import type { CompassDirection } from '../../types'
import { StrokeStyle, AnnotationLineStyle } from '../../../enums'
import type { AnnotationContext } from './context'
import { DIRECTION_VECTORS, RECT_ANCHOR } from './direction-helpers'
import { measureTextWidth, truncateToWidth } from '../../text-measure'

// ---------------------------------------------------------------------------
// Scale helpers
// ---------------------------------------------------------------------------

export function isPointScale(scale: AnnotationContext['scaleX']): scale is d3.ScalePoint<string> {
  return 'step' in scale && !('bandwidth' in scale)
}

export function isTimeScale(scale: AnnotationContext['scaleX']): scale is d3.ScaleTime<number, number> {
  if ('bandwidth' in scale || isPointScale(scale)) {
    return false
  }
  const domain = scale.domain()
  return domain.length > 0 && domain[0] instanceof Date
}

export function scaleXValue(scale: AnnotationContext['scaleX'], label: string): number {
  if ('bandwidth' in scale) {
    const band = scale as d3.ScaleBand<string>
    return (band(label) ?? 0) + band.bandwidth() / 2
  }
  if (isPointScale(scale)) {
    return scale(label) ?? 0
  }
  if (isTimeScale(scale)) {
    return scale(new Date(label)) as number
  }
  return (scale as d3.ScaleLinear<number, number>)(Number(label)) as number
}

// ---------------------------------------------------------------------------
// Anchor point computation
// ---------------------------------------------------------------------------

function rectAnchorPoint(
  dir: CompassDirection,
  rect: { left: number, right: number, top: number, bottom: number },
): { x: number, y: number } {
  const midX = (rect.left + rect.right) / 2
  const midY = (rect.top + rect.bottom) / 2
  const v = RECT_ANCHOR[dir] ?? RECT_ANCHOR.N
  return {
    x: midX + v.nx * (rect.right - rect.left) / 2,
    y: midY + v.ny * (rect.bottom - rect.top) / 2,
  }
}

export function computeAnchorPoint(
  datum: { label: string, value: number },
  scaleX: AnnotationContext['scaleX'],
  scaleY: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
  anchorDirection: CompassDirection,
  orientation?: 'horizontal',
): { x: number, y: number } {
  if ('bandwidth' in scaleX) {
    const band = scaleX as d3.ScaleBand<string>
    const bandPos = band(datum.label) ?? 0
    const bandW = band.bandwidth()
    const valPos = scaleY(datum.value)
    const zeroPos = scaleY(0)

    if (orientation === 'horizontal') {
      return rectAnchorPoint(anchorDirection, { left: zeroPos, right: valPos, top: bandPos, bottom: bandPos + bandW })
    }

    return rectAnchorPoint(anchorDirection, { left: bandPos, right: bandPos + bandW, top: valPos, bottom: zeroPos })
  }

  // Line charts (no bandwidth) — small fixed offsets around data point
  const px = scaleXValue(scaleX, datum.label)
  const py = scaleY(datum.value)
  const offset = 2
  const v = DIRECTION_VECTORS[anchorDirection] ?? DIRECTION_VECTORS.N
  return { x: px + v.dx * offset, y: py + v.dy * offset }
}

// ---------------------------------------------------------------------------
// Compute the point on a bounding box edge toward a target point
// ---------------------------------------------------------------------------

export function bboxEdgeToward(
  bbox: { x: number, y: number, width: number, height: number },
  targetX: number,
  targetY: number,
  pad: number = 4,
): { x: number, y: number } {
  const cx = bbox.x + bbox.width / 2
  const cy = bbox.y + bbox.height / 2

  if (targetX === cx && targetY === cy) {
    return { x: cx, y: cy }
  }

  const canNS = targetX >= bbox.x && targetX <= bbox.x + bbox.width
  const canEW = targetY >= bbox.y && targetY <= bbox.y + bbox.height

  type Side = { x: number, y: number, dist: number }
  const candidates: Side[] = []

  if (canNS) {
    if (targetY < cy) {
      candidates.push({ x: cx, y: bbox.y - pad, dist: Math.abs(cy - targetY) })
    }
    else { candidates.push({ x: cx, y: bbox.y + bbox.height + pad, dist: Math.abs(targetY - cy) }) }
  }
  if (canEW) {
    if (targetX > cx) {
      candidates.push({ x: bbox.x + bbox.width + pad, y: cy, dist: Math.abs(targetX - cx) })
    }
    else { candidates.push({ x: bbox.x - pad, y: cy, dist: Math.abs(cx - targetX) }) }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => a.dist - b.dist)
    const { x, y } = candidates[0]
    return { x, y }
  }

  const midpoints = [
    { x: cx, y: bbox.y - pad },
    { x: cx, y: bbox.y + bbox.height + pad },
    { x: bbox.x + bbox.width + pad, y: cy },
    { x: bbox.x - pad, y: cy },
  ]
  let best = midpoints[0]
  let bestDist = (best.x - targetX) ** 2 + (best.y - targetY) ** 2
  for (let i = 1; i < midpoints.length; i++) {
    const d = (midpoints[i].x - targetX) ** 2 + (midpoints[i].y - targetY) ** 2
    if (d < bestDist) {
      best = midpoints[i]
      bestDist = d
    }
  }
  return best
}

// ---------------------------------------------------------------------------
// Arrow marker
// ---------------------------------------------------------------------------

export function ensureArrowMarker(svg: SVGElement | null, color?: string): string {
  if (!svg) {
    return 'bc-arrow'
  }

  const safeColor = color ?? '#666'
  const id = `bc-arrow-${safeColor.replace(/[^a-zA-Z0-9]/g, '')}`

  if (svg.querySelector(`#${id}`)) {
    return id
  }

  const defs = d3.select(svg).select('defs').empty()
    ? d3.select(svg).append('defs')
    : d3.select(svg).select('defs')

  defs.append('marker')
    .attr('id', id)
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 9)
    .attr('refY', 5)
    .attr('markerWidth', 8)
    .attr('markerHeight', 8)
    .attr('markerUnits', 'userSpaceOnUse')
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M 1 1 L 9 5 L 1 9')
    .attr('fill', 'none')
    .attr('stroke', safeColor)
    .attr('stroke-width', 1.5)
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round')

  return id
}

// ---------------------------------------------------------------------------
// Target circle
// ---------------------------------------------------------------------------

function strokeDashForStyle(style: StrokeStyle): string {
  switch (style) {
    case StrokeStyle.Dotted: return '2,3'
    case StrokeStyle.Dashed: return '5,4'
    default: return ''
  }
}

/** Radius the annotation circle falls back to when `circleSize` is absent or unusable. */
const DEFAULT_CIRCLE_RADIUS = 4

/** Font size annotation text renders at. */
const TEXT_FONT_PX = 12

/**
 * A non-positive radius paints nothing — SVG rejects a negative `r` outright —
 * so an unusable size resolves to the documented default instead.
 */
export function resolveCircleRadius(size?: number): number {
  return size !== undefined && size > 0 ? size : DEFAULT_CIRCLE_RADIUS
}

export function renderTargetCircle(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  cx: number,
  cy: number,
  opts: {
    size?: number
    style?: StrokeStyle
    color?: string
  } = {},
): void {
  const circle = g.append('circle')
    .attr('class', 'bc-annotation-circle')
    .attr('cx', cx)
    .attr('cy', cy)
    .attr('r', resolveCircleRadius(opts.size))
    .attr('fill', 'none')
    .attr('stroke', opts.color ?? '#666')
    .attr('stroke-width', 1.5)

  const dash = strokeDashForStyle(opts.style ?? StrokeStyle.Solid)
  if (dash) {
    circle.attr('stroke-dasharray', dash)
  }
}

// ---------------------------------------------------------------------------
// Connecting line
// ---------------------------------------------------------------------------

const COT_40 = 1 / Math.tan(40 * Math.PI / 180) // ≈ 1.19175

function computeElbowMidpoint(
  from: { x: number, y: number },
  to: { x: number, y: number },
  departVertical: boolean,
): { x: number, y: number } {
  if (departVertical) {
    const vSign = to.y >= from.y ? 1 : -1
    const segLen = Math.max(Math.abs(to.y - from.y) - Math.abs(to.x - from.x) * COT_40, 12)
    return { x: from.x, y: from.y + vSign * segLen }
  }
  const hSign = to.x >= from.x ? 1 : -1
  const segLen = Math.max(Math.abs(to.x - from.x) - Math.abs(to.y - from.y) * COT_40, 12)
  return { x: from.x + hSign * segLen, y: from.y }
}

export function computeElbowPath(
  from: { x: number, y: number },
  to: { x: number, y: number },
  departVertical: boolean,
): string {
  const mid = computeElbowMidpoint(from, to, departVertical)
  return `M ${from.x} ${from.y} L ${mid.x} ${mid.y} L ${to.x} ${to.y}`
}

export function renderConnectingLine(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  from: { x: number, y: number },
  to: { x: number, y: number },
  style: AnnotationLineStyle = AnnotationLineStyle.Direct,
  opts: {
    showArrow?: boolean
    lineWeight?: number
    color?: string
    departVertical?: boolean
  } = {},
): void {
  let d: string

  switch (style) {
    case AnnotationLineStyle.CurveLeft:
    case AnnotationLineStyle.CurveRight: {
      const dx = to.x - from.x
      const dy = to.y - from.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const r = dist * 0.8
      const sweep = style === AnnotationLineStyle.CurveRight ? 1 : 0
      d = `M ${from.x} ${from.y} A ${r} ${r} 0 0 ${sweep} ${to.x} ${to.y}`
      break
    }
    case AnnotationLineStyle.Elbow: {
      d = computeElbowPath(from, to, opts.departVertical ?? false)
      break
    }
    default: {
      d = `M ${from.x} ${from.y} L ${to.x} ${to.y}`
    }
  }

  const lineColor = opts.color ?? '#666'
  const line = g.append('path')
    .attr('class', 'bc-annotation-line')
    .attr('d', d)
    .attr('fill', 'none')
    .attr('stroke', lineColor)
    .attr('stroke-width', opts.lineWeight ?? 1)
    .attr('pathLength', '1')
    .attr('data-line-style', style)
    .attr('data-line-from-x', String(from.x))
    .attr('data-line-from-y', String(from.y))
    .attr('data-line-to-x', String(to.x))
    .attr('data-line-to-y', String(to.y))
    .attr('data-line-depart-vertical', String(opts.departVertical ?? false))

  if (opts.showArrow === true) {
    const svg = g.node()?.ownerSVGElement ?? null
    const markerId = ensureArrowMarker(svg, lineColor)
    line.attr('marker-end', `url(#${markerId})`)
  }
}

// ---------------------------------------------------------------------------
// Text renderer with outline
// ---------------------------------------------------------------------------

export function renderAnnotationText(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  text: string,
  x: number,
  y: number,
  opts: {
    textColor?: string
    maxWidth?: number
    textAnchor?: string
    backgroundColor?: string
    textOutline?: boolean
  } = {},
): void {
  const anchor = opts.textAnchor ?? 'middle'
  const showOutline = opts.textOutline !== false

  const textEl = g.append('text')
    .attr('class', 'bc-annotation-text')
    .attr('x', x)
    .attr('y', y)
    .attr('text-anchor', anchor)
    .attr('font-size', `${TEXT_FONT_PX}px`)
    .attr('fill', opts.textColor ?? 'currentColor')

  if (showOutline) {
    textEl
      .attr('stroke', opts.backgroundColor ?? '#fff')
      .attr('stroke-width', 3)
      .attr('paint-order', 'stroke')
  }

  const lines = text.split('\n')
  if (lines.length > 1 || (opts.maxWidth && opts.maxWidth > 0)) {
    if (opts.maxWidth && opts.maxWidth > 0) {
      wrapText(textEl, text, opts.maxWidth)
    }
    else {
      for (let i = 0; i < lines.length; i++) {
        textEl.append('tspan')
          .attr('x', textEl.attr('x'))
          .attr('dy', i === 0 ? '0' : '1.2em')
          .text(lines[i])
      }
    }
  }
  else {
    textEl.text(text)
  }
}

function wrapText(
  textEl: d3.Selection<SVGTextElement, unknown, null, undefined>,
  text: string,
  maxWidth: number,
): void {
  let lineNumber = 0
  const emit = (line: string): void => {
    textEl.append('tspan')
      .attr('x', textEl.attr('x'))
      .attr('dy', lineNumber === 0 ? '0' : '1.2em')
      .text(line)
    lineNumber++
  }

  // Explicit newlines are hard breaks. Wrap each one to maxWidth on its own so
  // a `\n` in the BPC survives wrapping instead of collapsing into whitespace.
  for (const paragraph of text.split('\n')) {
    let line = ''
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word
      if (line && measureTextWidth(candidate, TEXT_FONT_PX) > maxWidth) {
        emit(line)
        line = word
      }
      else {
        line = candidate
      }
      // A URL or a CJK sentence offers no whitespace to break on, so a single
      // token wider than the box is broken mid-string instead of ignoring
      // maxWidth altogether.
      let head = truncateToWidth(line, maxWidth, TEXT_FONT_PX, '')
      while (head !== line) {
        emit(head)
        line = line.slice(head.length)
        head = truncateToWidth(line, maxWidth, TEXT_FONT_PX, '')
      }
    }
    emit(line)
  }
}

// ---------------------------------------------------------------------------
// Scale position helpers (for range/free renderers)
// ---------------------------------------------------------------------------

/**
 * Position on a continuous scale, clamped into the scale's range so an
 * out-of-domain endpoint stops at the edge of the plot instead of being painted
 * thousands of px off it. `null` when the endpoint is not a finite input for the
 * scale, which is what a category name reaching the value axis produces.
 */
function resolveOnContinuousScale(
  value: number | string,
  scale: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
): number | null {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    return null
  }
  return scale.copy().clamp(true)(numeric)
}

/**
 * Position of a range endpoint on the category axis, or `null` when the endpoint
 * does not resolve. Anchoring an unresolved endpoint at the plot origin would
 * silently highlight a category the author never named.
 */
export function resolveXPosition(
  value: number | string,
  scaleX: AnnotationContext['scaleX'],
  anchor: RangeAnchor = RangeAnchor.Center,
): number | null {
  if ('bandwidth' in scaleX) {
    const band = scaleX as d3.ScaleBand<string>
    const left = band(String(value))
    if (left === undefined) {
      return null
    }
    const bw = band.bandwidth()
    const gap = band.step() - bw
    if (anchor === 'start') {
      return left - gap / 2
    }
    if (anchor === 'end') {
      return left + bw + gap / 2
    }
    return left + bw / 2
  }
  if (isPointScale(scaleX)) {
    const pos = scaleX(String(value))
    if (pos === undefined) {
      return null
    }
    const halfStep = scaleX.step() / 2
    if (anchor === 'start') {
      return pos - halfStep
    }
    if (anchor === 'end') {
      return pos + halfStep
    }
    return pos
  }
  if (isTimeScale(scaleX)) {
    const date = new Date(String(value))
    if (Number.isNaN(date.getTime())) {
      return null
    }
    return scaleX.copy().clamp(true)(date)
  }
  return resolveOnContinuousScale(value, scaleX as d3.ScaleLinear<number, number>)
}

/** Position of a range endpoint on the value axis, or `null` when it does not resolve. */
export function resolveYPosition(
  value: number | string,
  scaleY: d3.ScaleLinear<number, number> | d3.ScaleSymLog<number, number>,
): number | null {
  return resolveOnContinuousScale(value, scaleY)
}
