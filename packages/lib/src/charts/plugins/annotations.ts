import * as d3 from 'd3'
import type { D3Blueprint, Plugin } from 'd3-blueprint'
import type { AnnotationConfig, AnnotationLineStyle, CompassDirection, RangeAnchor, StrokeStyle } from '../types'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface AnnotationContext {
  scaleX: d3.ScaleBand<string> | d3.ScaleTime<number, number> | d3.ScaleLinear<number, number>
  scaleY: d3.ScaleLinear<number, number>
  data: { label: string, value: number }[]
  width: number
  height: number
  backgroundColor?: string
  orientation?: 'horizontal'
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
  const px = (scaleX as d3.ScaleLinear<number, number>)(Number(datum.label)) as number
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

type BboxSide = { x: number, y: number, dist: number }

function bboxProjectionCandidates(
  bbox: { x: number, y: number, width: number, height: number },
  tx: number, ty: number, cx: number, cy: number, pad: number,
): BboxSide[] {
  const canNS = tx >= bbox.x && tx <= bbox.x + bbox.width
  const canEW = ty >= bbox.y && ty <= bbox.y + bbox.height
  const out: BboxSide[] = []
  if (canNS) {
    if (ty < cy) {
      out.push({ x: cx, y: bbox.y - pad, dist: Math.abs(cy - ty) })
    }
    else {
      out.push({ x: cx, y: bbox.y + bbox.height + pad, dist: Math.abs(ty - cy) })
    }
  }
  if (canEW) {
    if (tx > cx) {
      out.push({ x: bbox.x + bbox.width + pad, y: cy, dist: Math.abs(tx - cx) })
    }
    else {
      out.push({ x: bbox.x - pad, y: cy, dist: Math.abs(cx - tx) })
    }
  }
  return out
}

function closestCardinalMidpoint(
  bbox: { x: number, y: number, width: number, height: number },
  tx: number, ty: number, cx: number, cy: number, pad: number,
): { x: number, y: number } {
  const pts = [
    { x: cx, y: bbox.y - pad },
    { x: cx, y: bbox.y + bbox.height + pad },
    { x: bbox.x + bbox.width + pad, y: cy },
    { x: bbox.x - pad, y: cy },
  ]
  let best = pts[0]
  let bestDist = (best.x - tx) ** 2 + (best.y - ty) ** 2
  for (let i = 1; i < pts.length; i++) {
    const d = (pts[i].x - tx) ** 2 + (pts[i].y - ty) ** 2
    if (d < bestDist) {
      best = pts[i]
      bestDist = d
    }
  }
  return best
}

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
  const candidates = bboxProjectionCandidates(bbox, targetX, targetY, cx, cy, pad)
  if (candidates.length > 0) {
    candidates.sort((a, b) => a.dist - b.dist)
    return { x: candidates[0].x, y: candidates[0].y }
  }
  return closestCardinalMidpoint(bbox, targetX, targetY, cx, cy, pad)
}

// ---------------------------------------------------------------------------
// Arrow marker
// ---------------------------------------------------------------------------

function appendArrowMarkerDef(svg: SVGElement, id: string, color: string): void {
  const defs = d3.select(svg).select('defs').empty()
    ? d3.select(svg).append('defs')
    : d3.select(svg).select('defs')

  defs.append('marker')
    .attr('id', id)
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 7)
    .attr('refY', 5)
    .attr('markerWidth', 10)
    .attr('markerHeight', 10)
    .attr('markerUnits', 'strokeWidth')
    .attr('orient', 'auto-start-reverse')
    .append('path')
    .attr('d', 'M 0 1 L 7 5 L 0 9')
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', 1.5)
}

export function ensureArrowMarker(svg: SVGElement | null, color?: string): string {
  if (!svg) {
    return 'bc-arrow'
  }
  const safeColor = color ?? '#666'
  const id = `bc-arrow-${safeColor.replace(/[^a-zA-Z0-9]/g, '')}`
  if (!svg.querySelector(`#${id}`)) {
    appendArrowMarkerDef(svg, id, safeColor)
  }
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

function computeCurvePath(
  from: { x: number, y: number },
  to: { x: number, y: number },
  style: 'curve-left' | 'curve-right',
): string {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const r = dist * 0.8
  const sweep = style === 'curve-right' ? 1 : 0
  // End arc slightly before target, then straight stub so arrow points at target
  const stub = Math.min(8, dist * 0.15)
  const nx = dist > 0 ? dx / dist : 0
  const ny = dist > 0 ? dy / dist : 0
  const arcEnd = { x: to.x - nx * stub, y: to.y - ny * stub }
  return `M ${from.x} ${from.y} A ${r} ${r} 0 0 ${sweep} ${arcEnd.x} ${arcEnd.y} L ${to.x} ${to.y}`
}

function computeLinePath(
  from: { x: number, y: number },
  to: { x: number, y: number },
  style: AnnotationLineStyle,
  departVertical: boolean,
): string {
  switch (style) {
    case 'curve-left':
    case 'curve-right':
      return computeCurvePath(from, to, style)
    case 'elbow':
      return computeElbowPath(from, to, departVertical)
    default:
      return `M ${from.x} ${from.y} L ${to.x} ${to.y}`
  }
}

type LineOpts = { showArrow?: boolean, lineWeight?: number, color?: string, departVertical?: boolean }

export function renderConnectingLine(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  from: { x: number, y: number },
  to: { x: number, y: number },
  style: AnnotationLineStyle = 'direct',
  opts: LineOpts = {},
): void {
  const d = computeLinePath(from, to, style, opts.departVertical ?? false)
  const lineColor = opts.color ?? '#666'
  const line = g.append('path')
    .attr('class', 'bc-annotation-line')
    .attr('d', d)
    .attr('fill', 'none')
    .attr('stroke', lineColor)
    .attr('stroke-width', opts.lineWeight ?? 1)

  if (opts.showArrow === true) {
    const svg = g.node()?.ownerSVGElement ?? null
    const markerId = ensureArrowMarker(svg, lineColor)
    line.attr('marker-end', `url(#${markerId})`)
  }
}

// ---------------------------------------------------------------------------
// Text renderer with outline
// ---------------------------------------------------------------------------

function appendTspan(
  textEl: d3.Selection<SVGTextElement, unknown, null, undefined>,
  text: string,
  lineNumber: number,
): void {
  textEl.append('tspan')
    .attr('x', textEl.attr('x'))
    .attr('dy', lineNumber === 0 ? '0' : '1.2em')
    .text(text)
}

function appendTextContent(
  textEl: d3.Selection<SVGTextElement, unknown, null, undefined>,
  text: string,
  maxWidth?: number,
): void {
  const lines = text.split('\n')
  if (lines.length > 1 || (maxWidth && maxWidth > 0)) {
    if (maxWidth && maxWidth > 0) {
      wrapText(textEl, text, maxWidth)
    }
    else {
      for (let i = 0; i < lines.length; i++) {
        appendTspan(textEl, lines[i], i)
      }
    }
  }
  else {
    textEl.text(text)
  }
}

type TextOpts = { textColor?: string, maxWidth?: number, textAnchor?: string, backgroundColor?: string, textOutline?: boolean }

export function renderAnnotationText(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  text: string, x: number, y: number,
  opts: TextOpts = {},
): void {
  const textEl = g.append('text')
    .attr('class', 'bc-annotation-text')
    .attr('x', x)
    .attr('y', y)
    .attr('text-anchor', opts.textAnchor ?? 'middle')
    .attr('font-size', '12px')
    .attr('fill', opts.textColor ?? 'currentColor')

  if (opts.textOutline !== false) {
    textEl
      .attr('stroke', opts.backgroundColor ?? '#fff')
      .attr('stroke-width', 3)
      .attr('paint-order', 'stroke')
  }

  appendTextContent(textEl, text, opts.maxWidth)
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
      appendTspan(textEl, line, lineNumber++)
      line = word
    }
    else {
      line = test
    }
  }
  if (line) {
    appendTspan(textEl, line, lineNumber)
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
  const cx = 'bandwidth' in scaleX
    ? ((scaleX as d3.ScaleBand<string>)(datum.label) ?? 0) + (scaleX as d3.ScaleBand<string>).bandwidth() / 2
    : (scaleX as d3.ScaleLinear<number, number>)(Number(datum.label)) as number
  return { x: cx, y: scaleY(datum.value) }
}

// ---------------------------------------------------------------------------
// Point annotation
// ---------------------------------------------------------------------------

type PointLineConfig = {
  showLine?: boolean
  showArrow?: boolean
  lineStyle?: AnnotationLineStyle
  lineWeight?: number
  lineTargetDistance?: number
  showCircle?: boolean
  circleSize?: number
  anchorDirection?: CompassDirection
  textOffsetX?: number
  textOffsetY?: number
}

function resolvePointTextPosition(
  ann: Record<string, unknown>,
  lineConfig: PointLineConfig,
  datum: { label: string, value: number },
  anchor: { x: number, y: number },
  ctx: AnnotationContext,
): { tx: number, ty: number } {
  if (ann.dx != null || ann.dy != null) {
    const { x: cx, y: cy } = datumCenter(datum, ctx.scaleX, ctx.scaleY)
    return { tx: cx + (Number(ann.dx) || 40), ty: cy + (Number(ann.dy) || -40) }
  }
  if (ann.direction != null && ann.textOffsetX == null) {
    const { x: cx, y: cy } = datumCenter(datum, ctx.scaleX, ctx.scaleY)
    const offset = computeDirectionOffset(ann.direction as CompassDirection, (ann.anchorDistance as number | undefined) ?? 60)
    return { tx: cx + offset.dx, ty: cy + offset.dy }
  }
  return {
    tx: anchor.x + (lineConfig.textOffsetX ?? -42),
    ty: anchor.y + (lineConfig.textOffsetY ?? -42),
  }
}

function computeLineEndpoint(
  anchor: { x: number, y: number },
  tx: number, ty: number, ltd: number,
): { x: number, y: number } {
  if (ltd <= 0) {
    return { x: anchor.x, y: anchor.y }
  }
  const dx = anchor.x - tx
  const dy = anchor.y - ty
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) {
    return { x: anchor.x, y: anchor.y }
  }
  return { x: anchor.x - (dx / len) * ltd, y: anchor.y - (dy / len) * ltd }
}

function computeLineStart(
  annG: d3.Selection<SVGGElement, unknown, null, undefined>,
  tx: number, ty: number, to: { x: number, y: number },
): { start: { x: number, y: number }, departVertical: boolean } {
  let start = { x: tx, y: ty }
  let departVertical = false
  const textNode = annG.select('.bc-annotation-text').node() as SVGTextElement | null
  if (textNode) {
    try {
      const tBBox = textNode.getBBox()
      if (tBBox.width > 0 && tBBox.height > 0) {
        start = bboxEdgeToward(tBBox, to.x, to.y)
        departVertical = Math.abs(start.x - (tBBox.x + tBBox.width / 2)) < 1
      }
    }
    catch { /* getBBox can throw if not in DOM */ }
  }
  return { start, departVertical }
}

function renderPointCircleAndText(
  annG: d3.Selection<SVGGElement, unknown, null, undefined>,
  ann: AnnotationConfig,
  ctx: AnnotationContext,
  anchor: { x: number, y: number },
  tx: number, ty: number, lineColor: string,
): void {
  const circleConfig = ann as { showCircle?: boolean, circleSize?: number, circleStyle?: StrokeStyle }
  if (circleConfig.showCircle) {
    renderTargetCircle(annG, anchor.x, anchor.y, {
      size: circleConfig.circleSize, style: circleConfig.circleStyle, color: lineColor,
    })
  }
  if (ann.text) {
    const clampedX = Math.max(4, Math.min(tx, ctx.width - 4))
    renderAnnotationText(annG, ann.text, clampedX, ty - 4, {
      textColor: ann.textColor,
      maxWidth: resolveMaxWidth(ann.maxWidth, ctx.width),
      textAnchor: inferTextAnchorFromOffset(tx - anchor.x),
      backgroundColor: ctx.backgroundColor,
      textOutline: ann.textOutline,
    })
  }
}

function renderPointLine(
  annG: d3.Selection<SVGGElement, unknown, null, undefined>,
  legacyAnn: Record<string, unknown>,
  lineConfig: PointLineConfig,
  anchor: { x: number, y: number },
  tx: number, ty: number, lineColor: string,
): void {
  const isLegacy = legacyAnn.dx != null || legacyAnn.dy != null
  const showLine = isLegacy ? (lineConfig.showLine !== false) : (lineConfig.showLine === true)
  if (!showLine) {
    return
  }
  const ltd = lineConfig.showCircle
    ? (lineConfig.circleSize ?? 4) + (lineConfig.lineTargetDistance ?? 5)
    : (lineConfig.lineTargetDistance ?? 0)
  const to = computeLineEndpoint(anchor, tx, ty, ltd)
  const { start, departVertical } = computeLineStart(annG, tx, ty, to)
  renderConnectingLine(annG, start, to, lineConfig.lineStyle ?? 'direct', {
    showArrow: lineConfig.showArrow, lineWeight: lineConfig.lineWeight,
    color: lineColor, departVertical,
  })
}

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
  const lineConfig = ann as PointLineConfig
  const anchor = computeAnchorPoint(datum, ctx.scaleX, ctx.scaleY, lineConfig.anchorDirection ?? 'N', ctx.orientation)
  const legacyAnn = ann as Record<string, unknown>
  const { tx, ty } = resolvePointTextPosition(legacyAnn, lineConfig, datum, anchor, ctx)
  const lineColor = legacyAnn.circleColor as string | undefined ?? '#666'

  renderPointCircleAndText(annG, ann, ctx, anchor, tx, ty, lineColor)
  renderPointLine(annG, legacyAnn, lineConfig, anchor, tx, ty, lineColor)
}

// ---------------------------------------------------------------------------
// Range annotation
// ---------------------------------------------------------------------------

function resolveRangeRect(
  ann: AnnotationConfig & { kind: 'range' },
  ctx: AnnotationContext,
): { x: number, y: number, w: number, h: number } {
  const rangeOrientation = ann.orientation ?? 'vertical'
  if (ctx.orientation === 'horizontal') {
    if (rangeOrientation === 'vertical') {
      const y1 = resolveXPosition(ann.start, ctx.scaleX, ann.startAnchor)
      const y2 = resolveXPosition(ann.end, ctx.scaleX, ann.endAnchor)
      return { x: 0, y: Math.min(y1, y2), w: ctx.width, h: Math.abs(y2 - y1) }
    }
    const x1 = resolveYPosition(ann.start, ctx.scaleY)
    const x2 = resolveYPosition(ann.end, ctx.scaleY)
    return { x: Math.min(x1, x2), y: 0, w: Math.abs(x2 - x1), h: ctx.height }
  }
  if (rangeOrientation === 'vertical') {
    const x1 = resolveXPosition(ann.start, ctx.scaleX, ann.startAnchor)
    const x2 = resolveXPosition(ann.end, ctx.scaleX, ann.endAnchor)
    return { x: Math.min(x1, x2), y: 0, w: Math.abs(x2 - x1), h: ctx.height }
  }
  const y1 = resolveYPosition(ann.start, ctx.scaleY)
  const y2 = resolveYPosition(ann.end, ctx.scaleY)
  return { x: 0, y: Math.min(y1, y2), w: ctx.width, h: Math.abs(y2 - y1) }
}

function resolveRangeTextPosition(
  ann: AnnotationConfig & { kind: 'range' },
  rect: { x: number, y: number, w: number, h: number },
  ctxWidth: number,
): { textX: number, textY: number, textAnchor: string, ny: number } {
  const dir = ann.direction ?? 'center'
  const pad = 4
  const v = DIRECTION_VECTORS[dir] ?? DIRECTION_VECTORS.center
  const nx = 0.5 + v.dx * 0.5
  const ny = 0.5 + v.dy * 0.5
  const textX = Math.max(pad, Math.min(rect.x + rect.w * nx, ctxWidth - pad))
  let textAnchor = 'middle'
  if (nx < 0.25) {
    textAnchor = 'start'
  }
  else if (nx > 0.75) {
    textAnchor = 'end'
  }
  return { textX, textY: rect.y + pad + 12, textAnchor, ny }
}

function repositionRangeText(
  annG: d3.Selection<SVGGElement, unknown, null, undefined>,
  ny: number, y: number, h: number, pad: number,
): void {
  if (ny <= 0.25) {
    return
  }
  const textEl = annG.select('.bc-annotation-text').node() as SVGTextElement | null
  if (!textEl) {
    return
  }
  try {
    const tBBox = textEl.getBBox()
    const dy = ny > 0.75
      ? (y + h - pad) - (tBBox.y + tBBox.height)
      : (y + h / 2) - (tBBox.y + tBBox.height / 2)
    if (Math.abs(dy) > 0.5) {
      textEl.setAttribute('transform', `translate(0, ${dy})`)
    }
  }
  catch { /* getBBox can throw if not in DOM */ }
}

function renderRangeText(
  annG: d3.Selection<SVGGElement, unknown, null, undefined>,
  ann: AnnotationConfig & { kind: 'range' },
  ctx: AnnotationContext,
  rect: { x: number, y: number, w: number, h: number },
): void {
  if (!ann.text) {
    return
  }
  const bandWidth = (ann.orientation ?? 'vertical') === 'vertical' ? rect.w : rect.h
  const rangeMaxWidth = resolveMaxWidth(ann.maxWidth, ctx.width) ?? Math.max(bandWidth, 50)
  const { textX, textY, textAnchor, ny } = resolveRangeTextPosition(ann, rect, ctx.width)
  renderAnnotationText(annG, ann.text, textX, textY, {
    textColor: ann.textColor, maxWidth: rangeMaxWidth, textAnchor,
    backgroundColor: ctx.backgroundColor, textOutline: ann.textOutline,
  })
  repositionRangeText(annG, ny, rect.y, rect.h, 4)
}

function renderRangeAnnotation(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  ann: AnnotationConfig, ctx: AnnotationContext, index: number,
): void {
  if (ann.kind !== 'range') {
    return
  }
  const annG = g.append('g').attr('data-annotation-index', String(index))
  const rect = resolveRangeRect(ann, ctx)
  annG.append('rect')
    .attr('class', 'bc-annotation-range')
    .attr('x', rect.x).attr('y', rect.y).attr('width', rect.w).attr('height', rect.h)
    .attr('fill', ann.bgColor ?? '#ccc')
    .attr('opacity', (ann.bgOpacity ?? 20) / 100)
  renderRangeText(annG, ann, ctx, rect)
}

// ---------------------------------------------------------------------------
// Free annotation
// ---------------------------------------------------------------------------

function centerTextVertically(
  annG: d3.Selection<SVGGElement, unknown, null, undefined>,
  py: number,
): void {
  const textEl = annG.select('.bc-annotation-text').node() as SVGTextElement | null
  if (!textEl) {
    return
  }
  try {
    const bbox = textEl.getBBox()
    const dy = py - (bbox.y + bbox.height / 2)
    if (Math.abs(dy) > 0.5) {
      textEl.setAttribute('transform', `translate(0, ${dy})`)
    }
  }
  catch { /* getBBox can throw if not in DOM */ }
}

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
    centerTextVertically(annG, py)
  }
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

function renderAnnotation(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  rangeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  ann: AnnotationConfig, ctx: AnnotationContext, i: number,
): void {
  switch (ann.kind ?? 'point') {
    case 'point': renderPointAnnotation(g, ann, ctx, i)
      break
    case 'range': renderRangeAnnotation(rangeG, ann, ctx, i)
      break
    case 'free': renderFreeAnnotation(g, ann, ctx, i)
      break
  }
}

function renderAllAnnotations(
  base: d3.Selection<SVGElement, unknown, null, undefined>,
  annotations: AnnotationConfig[], ctx: AnnotationContext,
): void {
  const svg = base.node()?.ownerSVGElement ?? base.node()
  if (svg) {
    d3.select(svg).style('overflow', 'visible')
  }
  ensureArrowMarker(svg)
  const rangeG = base.insert('g', ':first-child').attr('class', 'bc-annotations-range') as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
  const g = base.append('g')
    .attr('class', 'bc-annotations')
    .attr('data-ctx-width', String(ctx.width))
    .attr('data-ctx-height', String(ctx.height)) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
  for (let i = 0; i < annotations.length; i++) {
    renderAnnotation(g, rangeG, annotations[i], ctx, i)
  }
  expandSvgToFitAnnotations(svg as SVGSVGElement | null)
}

export function createAnnotationPlugin(
  annotations: AnnotationConfig[],
  ctx: AnnotationContext,
): Plugin {
  return {
    name: 'annotations',
    install() {},
    postDraw(chart: D3Blueprint) {
      const base = (chart as unknown as { base: d3.Selection<SVGElement, unknown, null, undefined> }).base
      renderAllAnnotations(base, annotations, ctx)
    },
  }
}

// ---------------------------------------------------------------------------
// Dynamic viewBox expansion
// ---------------------------------------------------------------------------

function expandSvgToFitAnnotations(
  svg: SVGSVGElement | null,
): void {
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

  const pad = 8
  const minX = Math.min(0, totalBBox.x - pad)
  const minY = Math.min(0, totalBBox.y - pad)
  const maxX = Math.max(svgW, totalBBox.x + totalBBox.width + pad)
  const maxY = Math.max(svgH, totalBBox.y + totalBBox.height + pad)

  const needsExpand = minX < 0 || minY < 0 || maxX > svgW || maxY > svgH

  if (needsExpand) {
    // Only set viewBox — keep width/height the same so SVG scales to fit
    d3.select(svg)
      .attr('viewBox', `${minX} ${minY} ${maxX - minX} ${maxY - minY}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
  }
}
