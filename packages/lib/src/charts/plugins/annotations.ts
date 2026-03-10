import * as d3 from 'd3'
import type { D3Blueprint, Plugin } from 'd3-blueprint'
import type { AnnotationConfig, AnnotationLineStyle, CompassDirection, RangeAnchor, StrokeStyle } from '../types'
import { getDefaultTransitionMs } from '../motion'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface AnnotationContext {
  scaleX: d3.ScaleBand<string> | d3.ScalePoint<string> | d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>
  scaleY: d3.ScaleLinear<number, number>
  data: { label: string, value: number }[]
  width: number
  height: number
  backgroundColor?: string
  orientation?: 'horizontal'
  transition?: boolean
  /** Pre-computed snapshots of old annotation positions (captured before DOM is cleared). */
  priorAnnotations?: Map<string, AnnotationSnapshot>
}

// ---------------------------------------------------------------------------
// maxWidth resolution
// ---------------------------------------------------------------------------

function resolvePosition(value: number | string, size: number): number {
  // Percentage is center-relative: 0% = center, -50% = left/top edge, 50% = right/bottom edge
  if (typeof value === 'number') {
    return size / 2 + (value / 100) * size
  }
  const str = String(value)
  if (str.endsWith('%')) {
    return size / 2 + (parseFloat(str) / 100) * size
  }
  return parseFloat(str) || 0
}

function resolveMaxWidth(maxWidth: number | string | undefined, chartWidth: number): number | undefined {
  if (maxWidth == null) {
    return undefined
  }
  if (typeof maxWidth === 'number') {
    return maxWidth || undefined
  }
  const str = String(maxWidth)
  if (str.endsWith('%')) {
    return (parseFloat(str) / 100) * chartWidth
  }
  return parseFloat(str) || undefined
}

// ---------------------------------------------------------------------------
// Direction helpers
// ---------------------------------------------------------------------------

const DIRECTION_VECTORS: Record<CompassDirection, { dx: number, dy: number }> = {
  N: { dx: 0, dy: -1 },
  NE: { dx: 0.707, dy: -0.707 },
  E: { dx: 1, dy: 0 },
  SE: { dx: 0.707, dy: 0.707 },
  S: { dx: 0, dy: 1 },
  SW: { dx: -0.707, dy: 0.707 },
  W: { dx: -1, dy: 0 },
  NW: { dx: -0.707, dy: -0.707 },
  center: { dx: 0, dy: 0 },
}

const RECT_ANCHOR: Record<CompassDirection, { nx: number, ny: number }> = {
  N: { nx: 0, ny: -1 },
  NE: { nx: 1, ny: -1 },
  E: { nx: 1, ny: 0 },
  SE: { nx: 1, ny: 1 },
  S: { nx: 0, ny: 1 },
  SW: { nx: -1, ny: 1 },
  W: { nx: -1, ny: 0 },
  NW: { nx: -1, ny: -1 },
  center: { nx: 0, ny: 0 },
}

export function computeDirectionOffset(
  direction: CompassDirection,
  distance: number,
): { dx: number, dy: number } {
  const v = DIRECTION_VECTORS[direction] ?? DIRECTION_VECTORS.NW
  return { dx: v.dx * distance, dy: v.dy * distance }
}

// ---------------------------------------------------------------------------
// Horizontal orientation helpers (90° clockwise rotation for compass directions)
// ---------------------------------------------------------------------------

const HORIZONTAL_DIRECTION_MAP: Record<CompassDirection, CompassDirection> = {
  N: 'W',
  NE: 'NW',
  E: 'N',
  SE: 'NE',
  S: 'E',
  SW: 'SE',
  W: 'S',
  NW: 'SW',
  center: 'center',
}

export function rotateDirectionForHorizontal(dir: CompassDirection): CompassDirection {
  return HORIZONTAL_DIRECTION_MAP[dir] ?? dir
}

// ---------------------------------------------------------------------------
// Scale helpers
// ---------------------------------------------------------------------------

function isPointScale(scale: AnnotationContext['scaleX']): scale is d3.ScalePoint<string> {
  return 'step' in scale && !('bandwidth' in scale)
}

function isTimeScale(scale: AnnotationContext['scaleX']): scale is d3.ScaleTime<number, number> {
  if ('bandwidth' in scale || isPointScale(scale)) {
    return false
  }
  const domain = scale.domain()
  return domain.length > 0 && domain[0] instanceof Date
}

function scaleXValue(scale: AnnotationContext['scaleX'], label: string): number {
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
  scaleY: d3.ScaleLinear<number, number>,
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
      const dir = rotateDirectionForHorizontal(anchorDirection)
      return rectAnchorPoint(dir, { left: zeroPos, right: valPos, top: bandPos, bottom: bandPos + bandW })
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
// Infer text anchor from offset vector
// ---------------------------------------------------------------------------

function inferTextAnchorFromOffset(offsetX: number): string {
  if (offsetX < -4) {
    return 'end'
  }
  if (offsetX > 4) {
    return 'start'
  }
  return 'middle'
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

  // Check which perpendicular projections are valid:
  // Target X within horizontal span → can exit N or S
  const canNS = targetX >= bbox.x && targetX <= bbox.x + bbox.width
  // Target Y within vertical span → can exit E or W
  const canEW = targetY >= bbox.y && targetY <= bbox.y + bbox.height

  // Build candidate exit points for valid projections
  type Side = { x: number, y: number, dist: number }
  const candidates: Side[] = []

  if (canNS) {
    if (targetY < cy) { // N
      candidates.push({ x: cx, y: bbox.y - pad, dist: Math.abs(cy - targetY) })
    }
    else { candidates.push({ x: cx, y: bbox.y + bbox.height + pad, dist: Math.abs(targetY - cy) }) } // S
  }
  if (canEW) {
    if (targetX > cx) { // E
      candidates.push({ x: bbox.x + bbox.width + pad, y: cy, dist: Math.abs(targetX - cx) })
    }
    else { candidates.push({ x: bbox.x - pad, y: cy, dist: Math.abs(cx - targetX) }) } // W
  }

  // If we have valid perpendicular projections, pick the one with the shortest
  // distance from bbox center to target along that axis
  if (candidates.length > 0) {
    candidates.sort((a, b) => a.dist - b.dist)
    const { x, y } = candidates[0]
    return { x, y }
  }

  // Fallback: anchor is in a corner region — pick the closest cardinal midpoint
  const midpoints = [
    { x: cx, y: bbox.y - pad }, // N
    { x: cx, y: bbox.y + bbox.height + pad }, // S
    { x: bbox.x + bbox.width + pad, y: cy }, // E
    { x: bbox.x - pad, y: cy }, // W
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
    .attr('d', 'M 1 1 L 9 5 L 1 9 Z')
    .attr('fill', safeColor)

  return id
}

// ---------------------------------------------------------------------------
// Target circle
// ---------------------------------------------------------------------------

function strokeDashForStyle(style: StrokeStyle): string {
  switch (style) {
    case 'dotted': return '2,3'
    case 'dashed': return '5,4'
    default: return ''
  }
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
    .attr('r', opts.size ?? 4)
    .attr('fill', 'none')
    .attr('stroke', opts.color ?? '#666')
    .attr('stroke-width', 1.5)

  const dash = strokeDashForStyle(opts.style ?? 'solid')
  if (dash) {
    circle.attr('stroke-dasharray', dash)
  }
}

// ---------------------------------------------------------------------------
// Connecting line
// ---------------------------------------------------------------------------

// 140° bend angle → the second segment deflects 40° from the first
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
  style: AnnotationLineStyle = 'direct',
  opts: {
    showArrow?: boolean
    lineWeight?: number
    color?: string
    departVertical?: boolean
  } = {},
): void {
  let d: string

  switch (style) {
    case 'curve-left':
    case 'curve-right': {
      const dx = to.x - from.x
      const dy = to.y - from.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const r = dist * 0.8
      const sweep = style === 'curve-right' ? 1 : 0
      d = `M ${from.x} ${from.y} A ${r} ${r} 0 0 ${sweep} ${to.x} ${to.y}`
      break
    }
    case 'elbow': {
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
    // Store geometry for transition tweening
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
    .attr('font-size', '12px')
    .attr('fill', opts.textColor ?? 'currentColor')

  if (showOutline) {
    textEl
      .attr('stroke', opts.backgroundColor ?? '#fff')
      .attr('stroke-width', 3)
      .attr('paint-order', 'stroke')
  }

  // Split on newlines for multiline support
  const lines = text.split('\n')
  if (lines.length > 1 || (opts.maxWidth && opts.maxWidth > 0)) {
    // Multiline: create tspans
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
  const words = text.split(/\s+/)
  let line = ''
  let lineNumber = 0

  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (line && test.length * 7 > maxWidth) {
      textEl.append('tspan')
        .attr('x', textEl.attr('x'))
        .attr('dy', lineNumber === 0 ? '0' : '1.2em')
        .text(line)
      line = word
      lineNumber++
    }
    else {
      line = test
    }
  }
  if (line) {
    textEl.append('tspan')
      .attr('x', textEl.attr('x'))
      .attr('dy', lineNumber === 0 ? '0' : '1.2em')
      .text(line)
  }
}

// ---------------------------------------------------------------------------
// Scale position helpers
// ---------------------------------------------------------------------------

function resolveXPosition(
  value: number | string,
  scaleX: AnnotationContext['scaleX'],
  anchor: RangeAnchor = 'center',
): number {
  if ('bandwidth' in scaleX) {
    const band = scaleX as d3.ScaleBand<string>
    const left = band(String(value)) ?? 0
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
    const pos = scaleX(String(value)) ?? 0
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
    return scaleX(new Date(String(value))) as number
  }
  return (scaleX as d3.ScaleLinear<number, number>)(Number(value)) as number
}

function resolveYPosition(
  value: number | string,
  scaleY: d3.ScaleLinear<number, number>,
): number {
  return scaleY(Number(value))
}

// ---------------------------------------------------------------------------
// Datum center helper
// ---------------------------------------------------------------------------

function datumCenter(
  datum: { label: string, value: number },
  scaleX: AnnotationContext['scaleX'],
  scaleY: d3.ScaleLinear<number, number>,
): { x: number, y: number } {
  return { x: scaleXValue(scaleX, datum.label), y: scaleY(datum.value) }
}

// ---------------------------------------------------------------------------
// Point annotation
// ---------------------------------------------------------------------------

function renderPointAnnotation(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  ann: AnnotationConfig & { target?: string },
  ctx: AnnotationContext,
  index: number,
): void {
  const target = 'target' in ann ? (ann as { target: string }).target : undefined
  if (!target) {
    return
  }

  const datum = ctx.data.find(d => d.label === target)
  if (!datum) {
    return
  }

  const annG = g.append('g').attr('data-annotation-index', String(index))
  if (ann.id) {
    annG.attr('data-annotation-id', ann.id)
  }

  // Compute anchor point on shape
  const lineConfig = ann as { showLine?: boolean, showArrow?: boolean, lineStyle?: AnnotationLineStyle, lineWeight?: number, lineTargetDistance?: number, showCircle?: boolean, circleSize?: number, anchorDirection?: CompassDirection, textOffsetX?: number, textOffsetY?: number }
  const anchorDir = lineConfig.anchorDirection ?? 'N'
  const anchor = computeAnchorPoint(datum, ctx.scaleX, ctx.scaleY, anchorDir, ctx.orientation)

  // Determine text position from textOffsetX/Y, legacy dx/dy, or legacy direction+anchorDistance
  let tx: number
  let ty: number
  const legacyAnn = ann as Record<string, unknown>

  if (legacyAnn.dx != null || legacyAnn.dy != null) {
    // Legacy dx/dy support
    const { x: cx, y: cy } = datumCenter(datum, ctx.scaleX, ctx.scaleY)
    tx = cx + (Number(legacyAnn.dx) || 40)
    ty = cy + (Number(legacyAnn.dy) || -40)
  }
  else if (legacyAnn.direction != null && legacyAnn.textOffsetX == null) {
    // Legacy direction + anchorDistance → compute text position from center
    const { x: cx, y: cy } = datumCenter(datum, ctx.scaleX, ctx.scaleY)
    const direction = legacyAnn.direction as CompassDirection
    const distance = (legacyAnn.anchorDistance as number | undefined) ?? 60
    const offset = computeDirectionOffset(direction, distance)
    tx = cx + offset.dx
    ty = cy + offset.dy
  }
  else {
    // New: textOffsetX/Y from anchor point
    tx = anchor.x + (lineConfig.textOffsetX ?? -42)
    ty = anchor.y + (lineConfig.textOffsetY ?? -42)
  }

  // Shared line color for line, circle, and arrow
  const lineColor = (ann as Record<string, unknown>).circleColor as string | undefined ?? '#666'

  // Target circle at anchor point
  const circleConfig = ann as { showCircle?: boolean, circleSize?: number, circleStyle?: StrokeStyle }
  if (circleConfig.showCircle) {
    renderTargetCircle(annG, anchor.x, anchor.y, {
      size: circleConfig.circleSize,
      style: circleConfig.circleStyle,
      color: lineColor,
    })
  }

  // Text — render first so we can measure bbox for the line start
  if (ann.text) {
    const clampedX = Math.max(4, Math.min(tx, ctx.width - 4))
    const textAnchor = inferTextAnchorFromOffset(tx - anchor.x)
    renderAnnotationText(annG, ann.text, clampedX, ty - 4, {
      textColor: ann.textColor,
      maxWidth: resolveMaxWidth(ann.maxWidth, ctx.width),
      textAnchor,
      backgroundColor: ctx.backgroundColor,
      textOutline: ann.textOutline,
    })
  }

  // Arrow / connecting line — drawn after text so we can use text bbox
  const isLegacy = legacyAnn.dx != null || legacyAnn.dy != null
  const showLine = isLegacy ? (lineConfig.showLine !== false) : (lineConfig.showLine === true)
  if (showLine) {
    // Compute line start from text bbox edge toward anchor
    let lineStart = { x: tx, y: ty }
    let departVertical = false
    const textNode = annG.select('.bc-annotation-text').node() as SVGTextElement | null
    if (textNode) {
      try {
        const tBBox = textNode.getBBox()
        if (tBBox.width > 0 && tBBox.height > 0) {
          lineStart = bboxEdgeToward(tBBox, anchor.x, anchor.y)
          // N/S exit → vertical departure for elbow
          const bboxCx = tBBox.x + tBBox.width / 2
          departVertical = Math.abs(lineStart.x - bboxCx) < 1
        }
      }
      catch { /* getBBox can throw if not in DOM */ }
    }

    // Shorten the line end by lineTargetDistance, keeping the tip aligned
    // with the anchor along the anchor-normal axis.  For N/S anchors this
    // keeps the tip horizontally centered on the bar; for E/W it keeps it
    // vertically centered.
    const ltd = lineConfig.showCircle
      ? (lineConfig.circleSize ?? 4) + (lineConfig.lineTargetDistance ?? 5)
      : (lineConfig.lineTargetDistance ?? 0)
    let toX = anchor.x
    let toY = anchor.y
    if (ltd > 0) {
      const dx = anchor.x - lineStart.x
      const dy = anchor.y - lineStart.y
      const len = Math.sqrt(dx * dx + dy * dy)
      if (len > 0) {
        // Shorten along the line direction
        const rawToX = anchor.x - (dx / len) * ltd
        const rawToY = anchor.y - (dy / len) * ltd
        // Snap to anchor coordinate along the anchor-normal axis so the
        // tip stays centered on the bar rather than drifting diagonally.
        const v = DIRECTION_VECTORS[anchorDir] ?? DIRECTION_VECTORS.N
        toX = Math.abs(v.dx) > 0.01 ? rawToX : anchor.x
        toY = Math.abs(v.dy) > 0.01 ? rawToY : anchor.y
      }
    }

    renderConnectingLine(annG, lineStart, { x: toX, y: toY }, lineConfig.lineStyle ?? 'direct', {
      showArrow: lineConfig.showArrow,
      lineWeight: lineConfig.lineWeight,
      color: lineColor,
      departVertical,
    })
  }
}

// ---------------------------------------------------------------------------
// Range annotation
// ---------------------------------------------------------------------------

function renderRangeAnnotation(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  ann: AnnotationConfig,
  ctx: AnnotationContext,
  index: number,
  labelGroup?: d3.Selection<SVGGElement, unknown, null, undefined>,
): void {
  if (ann.kind !== 'range') {
    return
  }

  const annG = g.append('g').attr('data-annotation-index', String(index))
  if (ann.id) {
    annG.attr('data-annotation-id', ann.id)
  }
  const rangeOrientation = ann.orientation ?? 'vertical'

  let x: number, y: number, w: number, h: number

  if (ctx.orientation === 'horizontal') {
    // Horizontal bar charts: scaleX is band (vertical), scaleY is linear (horizontal)
    // "vertical" range annotation → uses band scale (scaleX) to resolve Y positions
    // "horizontal" range annotation → uses linear scale (scaleY) to resolve X positions
    if (rangeOrientation === 'vertical') {
      const y1 = resolveXPosition(ann.start, ctx.scaleX, ann.startAnchor)
      const y2 = resolveXPosition(ann.end, ctx.scaleX, ann.endAnchor)
      y = Math.min(y1, y2)
      h = Math.abs(y2 - y1)
      x = 0
      w = ctx.width
    }
    else {
      const x1 = resolveYPosition(ann.start, ctx.scaleY)
      const x2 = resolveYPosition(ann.end, ctx.scaleY)
      x = Math.min(x1, x2)
      w = Math.abs(x2 - x1)
      y = 0
      h = ctx.height
    }
  }
  else if (rangeOrientation === 'vertical') {
    const x1 = resolveXPosition(ann.start, ctx.scaleX, ann.startAnchor)
    const x2 = resolveXPosition(ann.end, ctx.scaleX, ann.endAnchor)
    x = Math.min(x1, x2)
    w = Math.abs(x2 - x1)
    y = 0
    h = ctx.height
  }
  else {
    const y1 = resolveYPosition(ann.start, ctx.scaleY)
    const y2 = resolveYPosition(ann.end, ctx.scaleY)
    y = Math.min(y1, y2)
    h = Math.abs(y2 - y1)
    x = 0
    w = ctx.width
  }

  annG.append('rect')
    .attr('class', 'bc-annotation-range')
    .attr('x', x)
    .attr('y', y)
    .attr('width', w)
    .attr('height', h)
    .attr('fill', ann.bgColor ?? '#ccc')
    .attr('opacity', (ann.bgOpacity ?? 20) / 100)

  if (ann.text) {
    // Determine the band width (the narrow dimension of the range)
    const bandWidth = rangeOrientation === 'vertical' ? w : h
    const rangeMaxWidth = resolveMaxWidth(ann.maxWidth, ctx.width) ?? Math.max(bandWidth, 50)

    // Position text inside the range rect based on direction
    // Direction maps to the interior corner/edge: N = top-center, NE = top-right, etc.
    const dir = ann.direction ?? 'center'
    const pad = 4

    // Map direction to normalized position within rect (0 = left/top, 0.5 = center, 1 = right/bottom)
    const v = DIRECTION_VECTORS[dir] ?? DIRECTION_VECTORS.center
    const nx = 0.5 + v.dx * 0.5 // 0, 0.5, or 1
    const ny = 0.5 + v.dy * 0.5

    const textX = Math.max(pad, Math.min(x + w * nx, ctx.width - pad))

    let textAnchor = 'middle'
    if (nx < 0.25) {
      textAnchor = 'start'
    }
    else if (nx > 0.75) {
      textAnchor = 'end'
    }

    // Render at top-inset position first, then adjust after measuring
    const fontSize = 12
    const textY = y + pad + fontSize

    // When a separate labelGroup is provided, render text there so it
    // appears above grid lines while the background rect stays behind.
    const textTarget = labelGroup
      ? labelGroup.append('g').attr('data-annotation-index', String(index))
      : annG

    renderAnnotationText(textTarget, ann.text, textX, textY, {
      textColor: ann.textColor,
      maxWidth: rangeMaxWidth,
      textAnchor,
      backgroundColor: ctx.backgroundColor,
      textOutline: ann.textOutline,
    })

    // Measure rendered text and reposition for center/bottom alignment
    if (ny > 0.25) {
      const textEl = textTarget.select('.bc-annotation-text').node() as SVGTextElement | null
      if (textEl) {
        try {
          const tBBox = textEl.getBBox()
          let dy = 0
          if (ny > 0.75) {
            dy = (y + h - pad) - (tBBox.y + tBBox.height)
          }
          else {
            dy = (y + h / 2) - (tBBox.y + tBBox.height / 2)
          }
          if (Math.abs(dy) > 0.5) {
            textEl.setAttribute('transform', `translate(0, ${dy})`)
          }
        }
        catch { /* getBBox can throw if not in DOM */ }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Free annotation
// ---------------------------------------------------------------------------

function renderFreeAnnotation(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  ann: AnnotationConfig,
  ctx: AnnotationContext,
  index: number,
): void {
  if (ann.kind !== 'free') {
    return
  }

  const annG = g.append('g').attr('data-annotation-index', String(index))
  if (ann.id) {
    annG.attr('data-annotation-id', ann.id)
  }

  const px = resolvePosition(ann.x, ctx.width)
  const py = resolvePosition(ann.y, ctx.height)

  if (ann.text) {
    renderAnnotationText(annG, ann.text, px, py, {
      textColor: ann.textColor,
      maxWidth: resolveMaxWidth(ann.maxWidth, ctx.width),
      textAnchor: 'middle',
      backgroundColor: ctx.backgroundColor,
      textOutline: ann.textOutline,
    })

    // Center vertically around the position point
    const textEl = annG.select('.bc-annotation-text').node() as SVGTextElement | null
    if (textEl) {
      try {
        const bbox = textEl.getBBox()
        const dy = py - (bbox.y + bbox.height / 2)
        if (Math.abs(dy) > 0.5) {
          textEl.setAttribute('transform', `translate(0, ${dy})`)
        }
      }
      catch { /* getBBox can throw if not in DOM */ }
    }
  }
}

// ---------------------------------------------------------------------------
// Standalone render (outside clip group)
// ---------------------------------------------------------------------------

export function renderAnnotations(
  parent: SVGGElement,
  annotations: AnnotationConfig[],
  ctx: AnnotationContext,
): void {
  const svg = parent.ownerSVGElement ?? parent
  d3.select(svg).style('overflow', 'visible')
  ensureArrowMarker(svg)

  const base = d3.select(parent)

  // Use pre-computed snapshots if provided, otherwise try DOM-based snapshot
  let oldSnapshots: Map<string, AnnotationSnapshot> | undefined
  if (ctx.transition) {
    if (ctx.priorAnnotations && ctx.priorAnnotations.size > 0) {
      oldSnapshots = ctx.priorAnnotations
    }
    else {
      const existingContainer = parent.querySelector('.bc-annotations')
      const existingRangeContainer = parent.querySelector('.bc-annotations-range')
      if (existingContainer || existingRangeContainer) {
        oldSnapshots = new Map()
        if (existingContainer) {
          for (const [k, v] of snapshotAnnotations(existingContainer)) {
            oldSnapshots.set(k, v)
          }
        }
        if (existingRangeContainer) {
          for (const [k, v] of snapshotAnnotations(existingRangeContainer)) {
            oldSnapshots.set(k, v)
          }
        }
      }
    }
  }

  // Remove old annotation containers
  parent.querySelectorAll('.bc-annotations, .bc-annotations-range').forEach(el => el.remove())

  const rangeGroup = base.insert('g', ':first-child').attr('class', 'bc-annotations-range') as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
  const g = base.append('g')
    .attr('class', 'bc-annotations')
    .attr('data-ctx-width', String(ctx.width))
    .attr('data-ctx-height', String(ctx.height)) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>

  for (let i = 0; i < annotations.length; i++) {
    const ann = annotations[i]
    const kind = ann.kind ?? 'point'

    switch (kind) {
      case 'point':
        renderPointAnnotation(g, ann, ctx, i)
        break
      case 'range':
        renderRangeAnnotation(rangeGroup, ann, ctx, i, g)
        break
      case 'free':
        renderFreeAnnotation(g, ann, ctx, i)
        break
    }
  }

  // Apply transitions during scene changes
  if (ctx.transition) {
    const duration = getDefaultTransitionMs()
    applyAnnotationTransitions(g.node()!, rangeGroup.node()!, oldSnapshots ?? new Map(), duration)
  }

  expandSvgToFitAnnotations(svg as SVGSVGElement | null)
}

// ---------------------------------------------------------------------------
// Transition helpers
// ---------------------------------------------------------------------------

export interface LineGeometry {
  style: string
  fromX: number
  fromY: number
  toX: number
  toY: number
  departVertical: boolean
}

export interface AnnotationSnapshot {
  id: string
  element: Element
  rect: { x: number, y: number, width: number, height: number }
  line?: LineGeometry
}

function readLineGeometry(el: Element): LineGeometry | undefined {
  const lineEl = el.querySelector('.bc-annotation-line')
  if (!lineEl || !lineEl.hasAttribute('data-line-style')) {
    return undefined
  }
  return {
    style: lineEl.getAttribute('data-line-style')!,
    fromX: parseFloat(lineEl.getAttribute('data-line-from-x') || '0'),
    fromY: parseFloat(lineEl.getAttribute('data-line-from-y') || '0'),
    toX: parseFloat(lineEl.getAttribute('data-line-to-x') || '0'),
    toY: parseFloat(lineEl.getAttribute('data-line-to-y') || '0'),
    departVertical: lineEl.getAttribute('data-line-depart-vertical') === 'true',
  }
}

export function snapshotAnnotations(container: Element): Map<string, AnnotationSnapshot> {
  const map = new Map<string, AnnotationSnapshot>()
  const groups = container.querySelectorAll('g[data-annotation-id]')
  for (const el of groups) {
    const id = el.getAttribute('data-annotation-id')!
    const line = readLineGeometry(el)
    try {
      const rect = (el as SVGGraphicsElement).getBBox()
      map.set(id, { id, element: el, rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, line })
    }
    catch {
      map.set(id, { id, element: el, rect: { x: 0, y: 0, width: 0, height: 0 }, line })
    }
  }
  return map
}

// ---------------------------------------------------------------------------
// Elbow path from interpolated coordinates
// ---------------------------------------------------------------------------

function elbowPathFromCoords(
  calloutX: number,
  calloutY: number,
  tipX: number,
  tipY: number,
): string {
  // Pivot midpoint: 45% from tip toward callout along X
  const midX = tipX + 0.45 * (calloutX - tipX)
  return `M ${calloutX} ${calloutY} L ${midX} ${calloutY} L ${tipX} ${tipY}`
}

// ---------------------------------------------------------------------------
// Draw entrance for lines (stroke-dashoffset animation)
// ---------------------------------------------------------------------------

function applyDrawEntrance(lineEl: SVGElement, durationMs: number): void {
  const hasArrow = lineEl.hasAttribute('marker-end')
  const geo = readLineGeometry(lineEl.parentElement!)

  if (hasArrow && geo) {
    // Arrow lines: grow the path so the arrowhead follows the tip.
    // Start with a zero-length path at the from point, then tween to final.
    const sel = d3.select(lineEl)
    const finalD = lineEl.getAttribute('d')!
    const startD = `M ${geo.fromX} ${geo.fromY} L ${geo.fromX} ${geo.fromY}`
    sel.attr('d', startD)

    if (geo.style === 'elbow') {
      const endCoords = { tipX: geo.toX, tipY: geo.toY, calloutX: geo.fromX, calloutY: geo.fromY }
      const startCoords = { tipX: geo.fromX, tipY: geo.fromY, calloutX: geo.fromX, calloutY: geo.fromY }
      sel.transition()
        .duration(durationMs)
        .ease(d3.easeCubicOut)
        .attrTween('d', () => {
          const interp = d3.interpolateObject(startCoords, endCoords)
          return (t: number) => {
            const c = interp(t)
            return elbowPathFromCoords(c.calloutX, c.calloutY, c.tipX, c.tipY)
          }
        })
    }
    else if (geo.style === 'curve-left' || geo.style === 'curve-right') {
      // Curve: grow arc parametrically so arrowhead traces the curve
      const from = { x: geo.fromX, y: geo.fromY }
      const to = { x: geo.toX, y: geo.toY }
      const dx = to.x - from.x
      const dy = to.y - from.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const r = dist * 0.8
      const sweep = geo.style === 'curve-right' ? 1 : 0

      // Compute arc center
      const halfChord = dist / 2
      const h = halfChord < r ? Math.sqrt(r * r - halfChord * halfChord) : 0
      const midX = (from.x + to.x) / 2
      const midY = (from.y + to.y) / 2
      const perpX = dist > 0 ? -dy / dist : 0
      const perpY = dist > 0 ? dx / dist : 0
      const centerSign = sweep === 1 ? 1 : -1
      const cx = midX + centerSign * h * perpX
      const cy = midY + centerSign * h * perpY

      // Start and end angles on the circle
      const startAngle = Math.atan2(from.y - cy, from.x - cx)
      const endAngle = Math.atan2(to.y - cy, to.x - cx)
      let delta = endAngle - startAngle
      // Normalize delta for sweep direction
      if (sweep === 1 && delta <= 0) {
        delta += 2 * Math.PI
      }
      if (sweep === 0 && delta >= 0) {
        delta -= 2 * Math.PI
      }

      sel.transition()
        .duration(durationMs)
        .ease(d3.easeCubicOut)
        .attrTween('d', () => (t: number) => {
          if (t >= 0.98) {
            return finalD
          }
          const angle = startAngle + t * delta
          const px = cx + r * Math.cos(angle)
          const py = cy + r * Math.sin(angle)
          return `M ${from.x} ${from.y} A ${r} ${r} 0 0 ${sweep} ${px} ${py}`
        })
    }
    else {
      // Direct: interpolate endpoint from start to final
      sel.transition()
        .duration(durationMs)
        .ease(d3.easeCubicOut)
        .attrTween('d', () => {
          const interpX = d3.interpolateNumber(geo.fromX, geo.toX)
          const interpY = d3.interpolateNumber(geo.fromY, geo.toY)
          return (t: number) => `M ${geo.fromX} ${geo.fromY} L ${interpX(t)} ${interpY(t)}`
        })
    }
  }
  else {
    // No arrow: use stroke-dashoffset draw
    lineEl.setAttribute('stroke-dasharray', '1')
    lineEl.setAttribute('stroke-dashoffset', '1')

    const sel = d3.select(lineEl)
    sel.transition()
      .duration(durationMs)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', '0')
      .on('end', () => {
        lineEl.removeAttribute('stroke-dasharray')
        lineEl.removeAttribute('stroke-dashoffset')
      })
  }
}

// ---------------------------------------------------------------------------
// Line move transition (tween path d attribute)
// ---------------------------------------------------------------------------

function applyLineMoveTransition(
  lineEl: SVGElement,
  oldLine: LineGeometry,
  durationMs: number,
): void {
  const newLine = readLineGeometry(lineEl.parentElement!)
  if (!newLine) {
    return
  }

  const sel = d3.select(lineEl)

  if (oldLine.style === 'elbow' && newLine.style === 'elbow') {
    // Elbow: attrTween with interpolateObject over 4 coordinates
    const oldCoords = { tipX: oldLine.toX, tipY: oldLine.toY, calloutX: oldLine.fromX, calloutY: oldLine.fromY }
    const newCoords = { tipX: newLine.toX, tipY: newLine.toY, calloutX: newLine.fromX, calloutY: newLine.fromY }

    // Set old path first
    sel.attr('d', elbowPathFromCoords(oldCoords.calloutX, oldCoords.calloutY, oldCoords.tipX, oldCoords.tipY))

    sel.transition()
      .duration(durationMs)
      .ease(d3.easeCubicInOut)
      .attrTween('d', () => {
        const interp = d3.interpolateObject(oldCoords, newCoords)
        return (t: number) => {
          const c = interp(t)
          return elbowPathFromCoords(c.calloutX, c.calloutY, c.tipX, c.tipY)
        }
      })
  }
  else {
    // Direct / curve: interpolate from/to coordinates and rebuild the path string
    const oldFrom = { x: oldLine.fromX, y: oldLine.fromY }
    const oldTo = { x: oldLine.toX, y: oldLine.toY }
    const newFrom = { x: newLine.fromX, y: newLine.fromY }
    const newTo = { x: newLine.toX, y: newLine.toY }

    // Save the final (new) path d, then set old path as starting point
    const newD = lineEl.getAttribute('d')!
    const oldD = `M ${oldFrom.x} ${oldFrom.y} L ${oldTo.x} ${oldTo.y}`
    sel.attr('d', oldD)

    sel.transition()
      .duration(durationMs)
      .ease(d3.easeCubicInOut)
      .attrTween('d', () => {
        const interpFrom = d3.interpolateObject(oldFrom, newFrom)
        const interpTo = d3.interpolateObject(oldTo, newTo)
        return (t: number) => {
          if (t >= 0.98) {
            return newD
          }
          const f = interpFrom(t)
          const tt = interpTo(t)
          if (newLine.style === 'direct' || oldLine.style === 'direct') {
            return `M ${f.x} ${f.y} L ${tt.x} ${tt.y}`
          }
          // Curve: rebuild arc with interpolated endpoints
          const dx = tt.x - f.x
          const dy = tt.y - f.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const r = dist * 0.8
          const sweep = newLine.style === 'curve-right' ? 1 : 0
          return `M ${f.x} ${f.y} A ${r} ${r} 0 0 ${sweep} ${tt.x} ${tt.y}`
        }
      })
  }
}

// ---------------------------------------------------------------------------
// Apply annotation transitions
// ---------------------------------------------------------------------------

function applyAnnotationTransitions(
  container: Element,
  rangeContainer: Element,
  oldSnapshots: Map<string, AnnotationSnapshot>,
  durationMs: number,
): void {
  if (durationMs <= 0) {
    return
  }

  // Collect new annotation groups from both containers
  const newGroups = [
    ...container.querySelectorAll('g[data-annotation-id]'),
    ...rangeContainer.querySelectorAll('g[data-annotation-id]'),
  ]

  const newIds = new Set<string>()
  for (const el of newGroups) {
    const id = el.getAttribute('data-annotation-id')!
    newIds.add(id)

    const old = oldSnapshots.get(id)
    if (old) {
      // Persistent annotation — move transition
      const lineEl = el.querySelector('.bc-annotation-line') as SVGElement | null
      if (lineEl && old.line) {
        // Tween the line path
        applyLineMoveTransition(lineEl, old.line, durationMs)
      }

      // FLIP translation for text and other elements
      try {
        const newRect = (el as SVGGraphicsElement).getBBox()
        const dx = old.rect.x - newRect.x
        const dy = old.rect.y - newRect.y
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          // Translate non-line children (text, circle) via FLIP
          const children = el.querySelectorAll('.bc-annotation-text, .bc-annotation-circle')
          for (const child of children) {
            const g = child as SVGElement
            g.style.transition = 'none'
            g.setAttribute('transform', `translate(${dx}, ${dy})`)
            void g.getBoundingClientRect()
            g.style.transition = `transform ${durationMs}ms ease`
            g.setAttribute('transform', 'translate(0, 0)')
          }
        }
      }
      catch { /* getBBox may fail */ }
    }
    else {
      // New annotation — draw entrance for lines, fade in for everything
      const lineEl = el.querySelector('.bc-annotation-line') as SVGElement | null
      if (lineEl) {
        applyDrawEntrance(lineEl, durationMs)
      }

      // Fade in text and circle
      const textAndCircle = el.querySelectorAll('.bc-annotation-text, .bc-annotation-circle')
      for (const child of textAndCircle) {
        const g = child as SVGElement
        g.style.opacity = '0'
        void g.getBoundingClientRect()
        g.style.transition = `opacity ${durationMs}ms ease`
        g.style.opacity = '1'
      }
    }
  }

  // Removed annotations — fade out old elements
  for (const [id, snapshot] of oldSnapshots) {
    if (!newIds.has(id)) {
      const clone = snapshot.element.cloneNode(true) as SVGElement
      container.appendChild(clone)
      clone.style.opacity = '1'
      void clone.getBoundingClientRect()
      clone.style.transition = `opacity ${durationMs}ms ease`
      clone.style.opacity = '0'
      setTimeout(() => clone.remove(), durationMs)
    }
  }
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function createAnnotationPlugin(
  annotations: AnnotationConfig[],
  ctx: AnnotationContext,
): Plugin {
  return {
    name: 'annotations',

    install() {},

    postDraw(chart: D3Blueprint) {
      const base = (chart as unknown as { base: d3.Selection<SVGElement, unknown, null, undefined> }).base

      const svg = base.node()?.ownerSVGElement ?? base.node()
      if (svg) {
        d3.select(svg).style('overflow', 'visible')
      }
      ensureArrowMarker(svg)

      // Render annotations on the parent of the clipped group so they
      // are not constrained by the chart-area clip-path.  Fall back to
      // base itself when there is no parent (e.g. standalone usage).
      const baseNode = base.node()
      const parentNode = baseNode?.parentNode as SVGGElement | null
      const target = parentNode && parentNode !== svg
        ? d3.select(parentNode) as unknown as d3.Selection<SVGElement, unknown, null, undefined>
        : base

      // Use pre-computed snapshots if provided (captured before renderer cleared DOM),
      // otherwise try to snapshot from current DOM.
      const targetEl = target.node() as Element
      let oldSnapshots: Map<string, AnnotationSnapshot> | undefined
      if (ctx.transition) {
        if (ctx.priorAnnotations && ctx.priorAnnotations.size > 0) {
          oldSnapshots = ctx.priorAnnotations
        }
        else if (targetEl) {
          const existingContainer = targetEl.querySelector('.bc-annotations')
          const existingRangeContainer = targetEl.querySelector('.bc-annotations-range')
          if (existingContainer || existingRangeContainer) {
            oldSnapshots = new Map()
            if (existingContainer) {
              for (const [k, v] of snapshotAnnotations(existingContainer)) {
                oldSnapshots.set(k, v)
              }
            }
            if (existingRangeContainer) {
              for (const [k, v] of snapshotAnnotations(existingRangeContainer)) {
                oldSnapshots.set(k, v)
              }
            }
          }
        }
      }

      // Remove old annotation containers
      if (targetEl) {
        targetEl.querySelectorAll('.bc-annotations, .bc-annotations-range').forEach(el => el.remove())
      }

      // Range annotations render behind chart content
      const rangeGroup = target.insert('g', ':first-child').attr('class', 'bc-annotations-range') as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
      // Point/free annotations render on top
      const g = target.append('g')
        .attr('class', 'bc-annotations')
        .attr('data-ctx-width', String(ctx.width))
        .attr('data-ctx-height', String(ctx.height)) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>

      for (let i = 0; i < annotations.length; i++) {
        const ann = annotations[i]
        const kind = ann.kind ?? 'point'

        switch (kind) {
          case 'point':
            renderPointAnnotation(g, ann, ctx, i)
            break
          case 'range':
            renderRangeAnnotation(rangeGroup, ann, ctx, i, g)
            break
          case 'free':
            renderFreeAnnotation(g, ann, ctx, i)
            break
        }
      }

      // Apply transitions during scene changes
      if (ctx.transition) {
        const duration = getDefaultTransitionMs()
        applyAnnotationTransitions(g.node()!, rangeGroup.node()!, oldSnapshots ?? new Map(), duration)
      }

      // Expand SVG viewBox if annotations extend beyond chart bounds
      expandSvgToFitAnnotations(svg as SVGSVGElement | null)
    },
  }
}

// ---------------------------------------------------------------------------
// Dynamic viewBox expansion
// ---------------------------------------------------------------------------

function expandSvgToFitAnnotations(svg: SVGSVGElement | null): void {
  if (!svg) {
    return
  }

  const svgW = parseFloat(svg.getAttribute('width') || '0')
  const svgH = parseFloat(svg.getAttribute('height') || '0')
  if (!svgW || !svgH) {
    return
  }

  // Use the full SVG bounding box which includes all child elements
  const totalBBox = svg.getBBox()
  if (totalBBox.width === 0 && totalBBox.height === 0) {
    return
  }

  // Only add padding on sides where content actually overflows the SVG
  // dimensions.  This prevents range annotations (which fill the chart
  // area exactly) from triggering unnecessary viewBox expansion.
  const pad = 8
  const rawMinX = totalBBox.x
  const rawMinY = totalBBox.y
  const rawMaxX = totalBBox.x + totalBBox.width
  const rawMaxY = totalBBox.y + totalBBox.height

  const vbMinX = rawMinX < 0 ? rawMinX - pad : 0
  const vbMinY = rawMinY < 0 ? rawMinY - pad : 0
  const vbMaxX = rawMaxX > svgW ? rawMaxX + pad : svgW
  const vbMaxY = rawMaxY > svgH ? rawMaxY + pad : svgH

  const needsExpand = vbMinX < 0 || vbMinY < 0 || vbMaxX > svgW || vbMaxY > svgH

  if (needsExpand) {
    // Only set viewBox — keep width/height the same so SVG scales to fit
    d3.select(svg)
      .attr('viewBox', `${vbMinX} ${vbMinY} ${vbMaxX - vbMinX} ${vbMaxY - vbMinY}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
  }
}
