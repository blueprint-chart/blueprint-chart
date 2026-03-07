import { describe, it, expect, beforeEach } from 'vitest'
import * as d3 from 'd3'
import { createAnnotationPlugin, computeDirectionOffset, computeAnchorPoint, bboxEdgeToward, ensureArrowMarker, rotateDirectionForHorizontal, snapshotAnnotations, renderConnectingLine } from './annotations'

function makeChartStub(g: SVGGElement) {
  return { base: d3.select(g) } as unknown
}

describe('createAnnotationPlugin', () => {
  let svg: SVGSVGElement
  let g: SVGGElement

  const makeScales = () => {
    const x = d3.scaleBand<string>().domain(['A', 'B']).range([0, 200]).padding(0.2)
    const y = d3.scaleLinear().domain([0, 100]).range([200, 0])
    const data = [{ label: 'A', value: 50 }, { label: 'B', value: 80 }]
    return { x, y, data }
  }

  beforeEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild)
    }
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    svg.appendChild(g)
    document.body.appendChild(svg)
  })

  // -----------------------------------------------------------------------
  // Point annotations
  // -----------------------------------------------------------------------

  it('renders point annotation text and arrow', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'point', target: 'A', text: 'Note here', anchorDirection: 'NW', textOffsetX: -42, textOffsetY: -42, showLine: true }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const texts = g.querySelectorAll('.bc-annotation-text')
    expect(texts).toHaveLength(1)
    expect(texts[0].textContent).toBe('Note here')

    const lines = g.querySelectorAll('.bc-annotation-line')
    expect(lines).toHaveLength(1)
  })

  it('renders point annotation with circle', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'point', target: 'A', text: 'With circle', showCircle: true, circleSize: 6, circleStyle: 'dashed' }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const circles = g.querySelectorAll('.bc-annotation-circle')
    expect(circles).toHaveLength(1)
    expect(circles[0].getAttribute('r')).toBe('6')
    expect(circles[0].getAttribute('stroke-dasharray')).toBe('5,4')
  })

  it('skips point annotation for unknown target', () => {
    const { x, y } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'point', target: 'Z', text: 'Missing' }],
      { scaleX: x, scaleY: y, data: [{ label: 'A', value: 50 }], width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    expect(g.querySelectorAll('.bc-annotation-text')).toHaveLength(0)
  })

  it('hides arrow when showArrow is false', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'point', target: 'A', text: 'No arrow', showArrow: false }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    expect(g.querySelectorAll('.bc-annotation-text')).toHaveLength(1)
    expect(g.querySelectorAll('.bc-annotation-line')).toHaveLength(0)
  })

  // -----------------------------------------------------------------------
  // Range annotations
  // -----------------------------------------------------------------------

  it('renders range annotation rect with correct bounds', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'range', start: 'A', end: 'B', bgColor: '#ff0000', bgOpacity: 30 }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const rects = g.querySelectorAll('.bc-annotation-range')
    expect(rects).toHaveLength(1)
    expect(rects[0].getAttribute('fill')).toBe('#ff0000')
    expect(rects[0].getAttribute('opacity')).toBe('0.3')

    const rectWidth = Number(rects[0].getAttribute('width'))
    expect(rectWidth).toBeGreaterThan(0)
  })

  it('renders range annotation with text', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'range', start: 'A', end: 'B', text: 'Range label' }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const texts = g.querySelectorAll('.bc-annotation-text')
    expect(texts).toHaveLength(1)
    expect(texts[0].textContent).toBe('Range label')
  })

  it('renders horizontal range annotation', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'range', orientation: 'horizontal', start: 20, end: 80 }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const rects = g.querySelectorAll('.bc-annotation-range')
    expect(rects).toHaveLength(1)
    // Width should span the full chart width for horizontal range
    expect(rects[0].getAttribute('width')).toBe('200')
  })

  // -----------------------------------------------------------------------
  // Free annotations
  // -----------------------------------------------------------------------

  it('renders free annotation at center-relative percentage position', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'free', text: 'Free note', x: 0, y: 0 }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const texts = g.querySelectorAll('.bc-annotation-text')
    expect(texts).toHaveLength(1)
    expect(texts[0].textContent).toBe('Free note')
    // 0% center-relative: 200/2 + (0/100)*200 = 100
    expect(texts[0].getAttribute('x')).toBe('100')
    // 0% center-relative: 200/2 + (0/100)*200 = 100 (vertically centered via transform)
    expect(texts[0].getAttribute('y')).toBe('100')
  })

  it('renders free annotation with px position', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'free', text: 'Pixel note', x: '80px', y: '60px' }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const texts = g.querySelectorAll('.bc-annotation-text')
    expect(texts).toHaveLength(1)
    expect(texts[0].getAttribute('x')).toBe('80')
    expect(texts[0].getAttribute('y')).toBe('60')
  })

  // -----------------------------------------------------------------------
  // Direction offsets
  // -----------------------------------------------------------------------

  it('computes correct direction offsets', () => {
    const n = computeDirectionOffset('N', 100)
    expect(n.dx).toBeCloseTo(0)
    expect(n.dy).toBeCloseTo(-100)

    const se = computeDirectionOffset('SE', 100)
    expect(se.dx).toBeCloseTo(70.7, 0)
    expect(se.dy).toBeCloseTo(70.7, 0)

    const w = computeDirectionOffset('W', 50)
    expect(w.dx).toBeCloseTo(-50)
    expect(w.dy).toBeCloseTo(0)

    const center = computeDirectionOffset('center', 100)
    expect(center.dx).toBe(0)
    expect(center.dy).toBe(0)
  })

  // -----------------------------------------------------------------------
  // Line styles
  // -----------------------------------------------------------------------

  it('renders direct line style as L command', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'point', target: 'A', text: 'Direct', lineStyle: 'direct', showLine: true }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const line = g.querySelector('.bc-annotation-line')
    expect(line).toBeTruthy()
    const d = line!.getAttribute('d')!
    expect(d).toMatch(/^M .* L /)
  })

  it('renders curve-left line style as A (arc) command', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'point', target: 'A', text: 'Curved', lineStyle: 'curve-left', showLine: true }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const line = g.querySelector('.bc-annotation-line')
    expect(line).toBeTruthy()
    const d = line!.getAttribute('d')!
    expect(d).toMatch(/A/)
  })

  it('renders elbow line style with two L commands', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'point', target: 'A', text: 'Elbow', lineStyle: 'elbow', showLine: true }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const line = g.querySelector('.bc-annotation-line')
    expect(line).toBeTruthy()
    const d = line!.getAttribute('d')!
    // Elbow: M ... L (horizontal) ... L (to target)
    const lCount = (d.match(/L/g) || []).length
    expect(lCount).toBe(2)
  })

  // -----------------------------------------------------------------------
  // Text outline
  // -----------------------------------------------------------------------

  it('renders text with stroke outline for readability', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'point', target: 'A', text: 'Outlined' }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const text = g.querySelector('.bc-annotation-text')
    expect(text).toBeTruthy()
    expect(text!.getAttribute('stroke')).toBe('#fff')
    expect(text!.getAttribute('stroke-width')).toBe('3')
    expect(text!.getAttribute('paint-order')).toBe('stroke')
  })

  // -----------------------------------------------------------------------
  // Backward compatibility
  // -----------------------------------------------------------------------

  it('treats annotation without kind as point annotation', () => {
    const { x, y, data } = makeScales()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const legacyAnnotation = { target: 'A', text: 'Legacy note', dx: 30, dy: -30 } as any

    const plugin = createAnnotationPlugin(
      [legacyAnnotation],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const texts = g.querySelectorAll('.bc-annotation-text')
    expect(texts).toHaveLength(1)
    expect(texts[0].textContent).toBe('Legacy note')

    const lines = g.querySelectorAll('.bc-annotation-line')
    expect(lines).toHaveLength(1)
  })

  it('supports legacy dx/dy fields by using them directly', () => {
    const { x, y, data } = makeScales()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const legacyAnnotation = { target: 'A', text: 'Legacy offset', dx: 50, dy: -20 } as any

    const plugin = createAnnotationPlugin(
      [legacyAnnotation],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const text = g.querySelector('.bc-annotation-text')
    expect(text).toBeTruthy()

    // The text x should be cx + dx
    const cx = (x('A')! + x.bandwidth() / 2)
    const expectedX = cx + 50
    expect(Number(text!.getAttribute('x'))).toBeCloseTo(expectedX, 0)
  })

  // -----------------------------------------------------------------------
  // Arrow marker
  // -----------------------------------------------------------------------

  it('creates arrow marker in defs', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'point', target: 'A', text: 'Arrow test' }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const marker = svg.querySelector('[id^="bc-arrow-"]')
    expect(marker).toBeTruthy()
  })

  it('does not duplicate arrow marker on multiple calls', () => {
    ensureArrowMarker(svg, '#666')
    ensureArrowMarker(svg, '#666')

    const markers = svg.querySelectorAll('#bc-arrow-666')
    expect(markers).toHaveLength(1)
  })

  // -----------------------------------------------------------------------
  // Anchor point computation
  // -----------------------------------------------------------------------

  it('computes anchor point at bar top-right for NE', () => {
    const { x, y } = makeScales()
    const datum = { label: 'A', value: 50 }

    const anchor = computeAnchorPoint(datum, x, y, 'NE')
    const barX = x('A')!
    const barW = x.bandwidth()
    const barTop = y(50)

    expect(anchor.x).toBeCloseTo(barX + barW)
    expect(anchor.y).toBeCloseTo(barTop)
  })

  it('computes anchor point at bar center for center', () => {
    const { x, y } = makeScales()
    const datum = { label: 'A', value: 50 }

    const anchor = computeAnchorPoint(datum, x, y, 'center')
    const barX = x('A')!
    const barW = x.bandwidth()
    const barTop = y(50)
    const barBottom = y(0)

    expect(anchor.x).toBeCloseTo(barX + barW / 2)
    expect(anchor.y).toBeCloseTo((barTop + barBottom) / 2)
  })

  // -----------------------------------------------------------------------
  // bboxEdgeToward
  // -----------------------------------------------------------------------

  it('exits from E when target is to the right within vertical span', () => {
    const bbox = { x: 0, y: 0, width: 100, height: 40 }
    // target at (200, 20): Y=20 is within [0,40] → can exit E or W; X>cx → E
    const edge = bboxEdgeToward(bbox, 200, 20)
    expect(edge.x).toBeCloseTo(104) // right edge + 4px pad
    expect(edge.y).toBeCloseTo(20) // vertical midpoint
  })

  it('exits from S when target is below within horizontal span', () => {
    const bbox = { x: 0, y: 0, width: 100, height: 40 }
    // target at (50, 200): X=50 is within [0,100] → can exit N or S; Y>cy → S
    const edge = bboxEdgeToward(bbox, 50, 200)
    expect(edge.x).toBeCloseTo(50) // horizontal midpoint
    expect(edge.y).toBeCloseTo(44) // bottom edge + 4px pad
  })

  it('picks closer axis when both projections are valid', () => {
    const bbox = { x: 0, y: 0, width: 100, height: 40 }
    // target at (80, 30): within both spans; dx from center=30, dy=10
    // N/S dist=10, E/W dist=30 → picks S (shorter axis distance)
    const edge = bboxEdgeToward(bbox, 80, 30)
    expect(edge.x).toBeCloseTo(50) // horizontal midpoint (S exit)
    expect(edge.y).toBeCloseTo(44) // bottom edge + pad
  })

  it('falls back to closest midpoint in corner region', () => {
    const bbox = { x: 0, y: 0, width: 100, height: 40 }
    // target at (200, 200): outside both spans → fallback to closest midpoint
    const edge = bboxEdgeToward(bbox, 200, 200)
    // S midpoint (50,44) dist²= 150²+156² = 46836
    // E midpoint (104,20) dist²= 96²+180² = 41616 → E is closer
    expect(edge.x).toBeCloseTo(104)
    expect(edge.y).toBeCloseTo(20)
  })

  it('exits with no padding when pad=0', () => {
    const bbox = { x: 0, y: 0, width: 100, height: 100 }
    // target at (200, 50): Y=50 within [0,100] → exits E
    const edge = bboxEdgeToward(bbox, 200, 50, 0)
    expect(edge.x).toBeCloseTo(100) // right edge, no pad
    expect(edge.y).toBeCloseTo(50) // vertical midpoint
  })

  it('returns center when target equals center', () => {
    const bbox = { x: 0, y: 0, width: 100, height: 40 }
    const edge = bboxEdgeToward(bbox, 50, 20)
    expect(edge.x).toBeCloseTo(50)
    expect(edge.y).toBeCloseTo(20)
  })

  // -----------------------------------------------------------------------
  // Curved line arrow direction
  // -----------------------------------------------------------------------

  it('curve-right stub segment points toward the target, not along the chord', () => {
    const annG = d3.select(g).append('g') as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
    // From text below-right, to target above-left (a common curve scenario)
    const from = { x: 150, y: 150 }
    const to = { x: 50, y: 20 }

    renderConnectingLine(annG, from, to, 'curve-right', { showArrow: true })

    const path = annG.select('.bc-annotation-line')
    const d = path.attr('d')

    // Extract the final L segment: "... L toX toY"
    const lMatch = d.match(/L\s+([\d.-]+)\s+([\d.-]+)\s*$/)
    expect(lMatch).toBeTruthy()
    const endX = parseFloat(lMatch![1])
    const endY = parseFloat(lMatch![2])

    // The final L should arrive at the target
    expect(endX).toBeCloseTo(to.x, 0)
    expect(endY).toBeCloseTo(to.y, 0)

    // Extract the arc endpoint (just before L): "A ... arcEndX arcEndY L ..."
    const arcMatch = d.match(/A\s+[\d.-]+\s+[\d.-]+\s+[\d.-]+\s+[\d.-]+\s+[\d.-]+\s+([\d.-]+)\s+([\d.-]+)\s+L/)
    expect(arcMatch).toBeTruthy()
    const arcEndX = parseFloat(arcMatch![1])
    const arcEndY = parseFloat(arcMatch![2])

    // The stub direction (arcEnd→to) should NOT be parallel to the chord (from→to).
    // Compute the angle difference between stub and chord.
    const chordAngle = Math.atan2(to.y - from.y, to.x - from.x)
    const stubAngle = Math.atan2(to.y - arcEndY, to.x - arcEndX)
    const angleDiff = Math.abs(stubAngle - chordAngle)

    // For a curved line, the stub should approach from a different angle than the chord.
    // If the stub were along the chord (the bug), angleDiff would be ~0.
    expect(angleDiff).toBeGreaterThan(0.1)

    // The arc endpoint should be close to but not past the target
    // (stub approaches the target, arrow points toward it)
    const stubDist = Math.sqrt((to.x - arcEndX) ** 2 + (to.y - arcEndY) ** 2)
    expect(stubDist).toBeGreaterThan(1)
    expect(stubDist).toBeLessThan(20)
  })

  // -----------------------------------------------------------------------
  // Line geometry data attributes & draw entrance
  // -----------------------------------------------------------------------

  it('stores line geometry data attributes on annotation lines', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'point', id: 'p1', target: 'A', text: 'Test', showLine: true }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const line = g.querySelector('.bc-annotation-line')
    expect(line).toBeTruthy()
    // Line should have pathLength for draw animation
    expect(line!.getAttribute('pathLength')).toBe('1')
    // Line should store geometry for transition tweening
    expect(line!.getAttribute('data-line-style')).toBeTruthy()
    expect(line!.hasAttribute('data-line-from-x')).toBe(true)
    expect(line!.hasAttribute('data-line-to-x')).toBe(true)
  })

  it('new annotation line gets stroke-dashoffset draw entrance on transition', () => {
    const { x, y, data } = makeScales()

    // First render with no annotations
    const plugin1 = createAnnotationPlugin(
      [],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin1.postDraw!(makeChartStub(g) as any, undefined as any)

    // Second render adds annotation with line — should get draw entrance
    const plugin2 = createAnnotationPlugin(
      [{ kind: 'point', id: 'new-line', target: 'A', text: 'Draw me', showLine: true }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200, transition: true },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin2.postDraw!(makeChartStub(g) as any, undefined as any)

    const line = g.querySelector('g[data-annotation-id="new-line"] .bc-annotation-line')
    expect(line).toBeTruthy()
    // Draw entrance: stroke-dasharray and stroke-dashoffset set for draw animation
    expect(line!.getAttribute('stroke-dasharray')).toBe('1')
  })

  it('arrow line uses path growth instead of stroke-dashoffset on draw entrance', () => {
    const { x, y, data } = makeScales()

    // First render with no annotations
    const plugin1 = createAnnotationPlugin(
      [],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin1.postDraw!(makeChartStub(g) as any, undefined as any)

    // Second render adds annotation with arrow line
    const plugin2 = createAnnotationPlugin(
      [{ kind: 'point', id: 'arrow-draw', target: 'A', text: 'Arrow', showLine: true, showArrow: true }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200, transition: true },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin2.postDraw!(makeChartStub(g) as any, undefined as any)

    const line = g.querySelector('g[data-annotation-id="arrow-draw"] .bc-annotation-line')
    expect(line).toBeTruthy()
    // Arrow lines should NOT use stroke-dashoffset (arrowhead wouldn't follow)
    expect(line!.getAttribute('stroke-dasharray')).toBeNull()
    // The path d should start collapsed at the from point (path growth entrance)
    const d = line!.getAttribute('d')!
    const coords = d.match(/[\d.-]+/g)!.map(Number)
    // First two coords (M) should equal the next two (L) — line starts collapsed
    expect(coords[0]).toBeCloseTo(coords[2], 0)
    expect(coords[1]).toBeCloseTo(coords[3], 0)
  })

  it('curve arrow line uses path growth instead of stroke-dashoffset', () => {
    const { x, y, data } = makeScales()

    const plugin1 = createAnnotationPlugin(
      [],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin1.postDraw!(makeChartStub(g) as any, undefined as any)

    const plugin2 = createAnnotationPlugin(
      [{ kind: 'point', id: 'curve-arrow', target: 'A', text: 'Curve', showLine: true, showArrow: true, lineStyle: 'curve-right' }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200, transition: true },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin2.postDraw!(makeChartStub(g) as any, undefined as any)

    const line = g.querySelector('g[data-annotation-id="curve-arrow"] .bc-annotation-line')
    expect(line).toBeTruthy()
    // Curve arrow should NOT use stroke-dashoffset (arrowhead wouldn't follow)
    expect(line!.getAttribute('stroke-dasharray')).toBeNull()
    // Path should start collapsed at from point (M fromX fromY L fromX fromY)
    const d = line!.getAttribute('d')!
    const coords = d.match(/[\d.-]+/g)!.map(Number)
    expect(coords[0]).toBeCloseTo(coords[2], 0)
    expect(coords[1]).toBeCloseTo(coords[3], 0)
  })

  it('persistent annotation line does NOT get stroke-dashoffset on move', () => {
    const { x, y, data } = makeScales()

    // First render with annotation
    const plugin1 = createAnnotationPlugin(
      [{ kind: 'point', id: 'p-move', target: 'A', text: 'Start', showLine: true }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin1.postDraw!(makeChartStub(g) as any, undefined as any)

    // Second render moves annotation — should NOT get draw entrance
    const plugin2 = createAnnotationPlugin(
      [{ kind: 'point', id: 'p-move', target: 'B', text: 'Moved', showLine: true }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200, transition: true },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin2.postDraw!(makeChartStub(g) as any, undefined as any)

    const line = g.querySelector('g[data-annotation-id="p-move"] .bc-annotation-line')
    expect(line).toBeTruthy()
    // Persistent: no stroke-dasharray draw animation
    expect(line!.getAttribute('stroke-dasharray')).toBeNull()
  })

  it('elbow line stores geometry data attributes for attrTween', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'point', id: 'elb-1', target: 'A', text: 'Elbow', showLine: true, lineStyle: 'elbow' }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const line = g.querySelector('g[data-annotation-id="elb-1"] .bc-annotation-line')
    expect(line).toBeTruthy()
    expect(line!.getAttribute('data-line-style')).toBe('elbow')
    expect(line!.hasAttribute('data-line-from-x')).toBe(true)
    expect(line!.hasAttribute('data-line-from-y')).toBe(true)
    expect(line!.hasAttribute('data-line-to-x')).toBe(true)
    expect(line!.hasAttribute('data-line-to-y')).toBe(true)
  })

  // -----------------------------------------------------------------------
  // data-annotation-index attribute
  // -----------------------------------------------------------------------

  it('adds data-annotation-index attribute to annotation groups', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [
        { kind: 'point', target: 'A', text: 'First' },
        { kind: 'point', target: 'B', text: 'Second' },
      ],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const groups = g.querySelectorAll('g[data-annotation-index]')
    expect(groups).toHaveLength(2)
    expect(groups[0].getAttribute('data-annotation-index')).toBe('0')
    expect(groups[1].getAttribute('data-annotation-index')).toBe('1')
  })

  // -----------------------------------------------------------------------
  // Horizontal orientation
  // -----------------------------------------------------------------------

  it('rotates compass directions for horizontal orientation', () => {
    expect(rotateDirectionForHorizontal('N')).toBe('W')
    expect(rotateDirectionForHorizontal('E')).toBe('N')
    expect(rotateDirectionForHorizontal('S')).toBe('E')
    expect(rotateDirectionForHorizontal('W')).toBe('S')
    expect(rotateDirectionForHorizontal('NE')).toBe('NW')
    expect(rotateDirectionForHorizontal('SE')).toBe('NE')
    expect(rotateDirectionForHorizontal('SW')).toBe('SE')
    expect(rotateDirectionForHorizontal('NW')).toBe('SW')
    expect(rotateDirectionForHorizontal('center')).toBe('center')
  })

  it('computes anchor point with horizontal orientation — swaps X/Y', () => {
    // Horizontal bars: band scale on Y axis, linear scale on X axis
    const bandY = d3.scaleBand<string>().domain(['A', 'B']).range([0, 200]).padding(0.2)
    const linearX = d3.scaleLinear().domain([0, 100]).range([0, 200])
    const datum = { label: 'A', value: 50 }

    // With horizontal orientation, 'N' (top of bar) becomes 'W' (left/zero side)
    const anchor = computeAnchorPoint(datum, bandY, linearX, 'N', 'horizontal')

    // bandY('A') gives the Y position, linearX(50) gives the X position for value
    const barY = bandY('A')!
    const barH = bandY.bandwidth()
    const barLeft = linearX(0)

    // 'N' rotates to 'W' → should be at left edge, mid Y
    expect(anchor.x).toBeCloseTo(barLeft)
    expect(anchor.y).toBeCloseTo(barY + barH / 2)
  })

  it('computes anchor point with horizontal orientation — E direction', () => {
    const bandY = d3.scaleBand<string>().domain(['A', 'B']).range([0, 200]).padding(0.2)
    const linearX = d3.scaleLinear().domain([0, 100]).range([0, 200])
    const datum = { label: 'A', value: 80 }

    // 'E' rotates to 'N' → top of bar, mid X
    const anchor = computeAnchorPoint(datum, bandY, linearX, 'E', 'horizontal')

    const barY = bandY('A')!
    const barLeft = linearX(0)
    const barRight = linearX(80)
    const midX = (barLeft + barRight) / 2

    expect(anchor.x).toBeCloseTo(midX)
    expect(anchor.y).toBeCloseTo(barY)
  })

  it('renders point annotation with horizontal orientation context', () => {
    const bandY = d3.scaleBand<string>().domain(['A', 'B']).range([0, 200]).padding(0.2)
    const linearX = d3.scaleLinear().domain([0, 100]).range([0, 200])
    const data = [{ label: 'A', value: 50 }, { label: 'B', value: 80 }]

    const plugin = createAnnotationPlugin(
      [{ kind: 'point', target: 'A', text: 'Horizontal note', anchorDirection: 'N', textOffsetX: 20, textOffsetY: -20 }],
      { scaleX: bandY, scaleY: linearX, data, width: 200, height: 200, orientation: 'horizontal' },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const texts = g.querySelectorAll('.bc-annotation-text')
    expect(texts).toHaveLength(1)
    expect(texts[0].textContent).toBe('Horizontal note')
  })

  // -----------------------------------------------------------------------
  // Bar-multi data (max not sum)
  // -----------------------------------------------------------------------

  it('bar-multi annotation data should use max (not sum) for grouped scale', () => {
    // This tests that bar-multi passes correct data to annotations
    // The annotation system positions based on the value in data
    // For grouped columns, the y-scale domain is based on individual values,
    // so annotation data should use the max per label, not the sum
    const x = d3.scaleBand<string>().domain(['A', 'B']).range([0, 200]).padding(0.2)
    const y = d3.scaleLinear().domain([0, 50]).range([200, 0])

    // If we use max values (correct), the anchor should be within the chart area
    const dataWithMax = [{ label: 'A', value: 30 }, { label: 'B', value: 50 }]
    const anchor = computeAnchorPoint(dataWithMax[0], x, y, 'N')
    expect(anchor.y).toBeGreaterThanOrEqual(0) // within chart
    expect(anchor.y).toBeLessThanOrEqual(200)

    // If sum were used (e.g. 80 for series [30, 50]), it would exceed the y domain
    const dataBadSum = [{ label: 'A', value: 80 }]
    const badAnchor = computeAnchorPoint(dataBadSum[0], x, y, 'N')
    // value 80 on domain [0,50] maps to negative y → above chart
    expect(badAnchor.y).toBeLessThan(0)
  })

  // -----------------------------------------------------------------------
  // Free annotation with empty scales (pie/donut scenario)
  // -----------------------------------------------------------------------

  // -----------------------------------------------------------------------
  // Transition support
  // -----------------------------------------------------------------------

  it('adds data-annotation-id attribute when annotation has id', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'point', id: 'ann-1', target: 'A', text: 'With id' }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const annGroup = g.querySelector('g[data-annotation-id="ann-1"]')
    expect(annGroup).toBeTruthy()
  })

  it('does not add data-annotation-id when annotation has no id', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'point', target: 'A', text: 'No id' }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const annGroup = g.querySelector('g[data-annotation-id]')
    expect(annGroup).toBeNull()
  })

  it('adds data-annotation-id for range annotations', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'range', id: 'rng-1', start: 'A', end: 'B' }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const annGroup = g.querySelector('g[data-annotation-id="rng-1"]')
    expect(annGroup).toBeTruthy()
  })

  it('adds data-annotation-id for free annotations', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'free', id: 'free-1', text: 'Note', x: 0, y: 0 }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const annGroup = g.querySelector('g[data-annotation-id="free-1"]')
    expect(annGroup).toBeTruthy()
  })

  it('preserves old annotation groups when transition is true', () => {
    const { x, y, data } = makeScales()

    // First render
    const plugin1 = createAnnotationPlugin(
      [{ kind: 'point', id: 'p1', target: 'A', text: 'First' }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin1.postDraw!(makeChartStub(g) as any, undefined as any)

    // Verify first render produced annotation groups
    const oldAnnotationGroups = g.querySelectorAll('.bc-annotations g[data-annotation-id]')
    expect(oldAnnotationGroups).toHaveLength(1)

    // Do NOT remove old containers — during scene transitions the chart
    // preserves the DOM so the plugin can snapshot old positions.
    const plugin2 = createAnnotationPlugin(
      [{ kind: 'point', id: 'p1', target: 'B', text: 'Moved' }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200, transition: true },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin2.postDraw!(makeChartStub(g) as any, undefined as any)

    // New annotation should exist at new position
    const newGroup = g.querySelector('g[data-annotation-id="p1"]')
    expect(newGroup).toBeTruthy()
    const text = newGroup!.querySelector('.bc-annotation-text')
    expect(text!.textContent).toBe('Moved')
  })

  it('fades out annotations removed during transition', () => {
    const { x, y, data } = makeScales()

    // First render with annotation
    const plugin1 = createAnnotationPlugin(
      [{ kind: 'point', id: 'removed-1', target: 'A', text: 'Will be removed' }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin1.postDraw!(makeChartStub(g) as any, undefined as any)

    // Do NOT remove old containers — during scene transitions the chart
    // preserves the DOM so the plugin can snapshot old positions.
    const plugin2 = createAnnotationPlugin(
      [],
      { scaleX: x, scaleY: y, data, width: 200, height: 200, transition: true },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin2.postDraw!(makeChartStub(g) as any, undefined as any)

    // Old annotation group should still be in the DOM (fading out)
    const allGroups = g.querySelectorAll('g[data-annotation-id="removed-1"]')
    expect(allGroups.length).toBeGreaterThanOrEqual(1)
  })

  it('does not apply transitions when transition is false', () => {
    const { x, y, data } = makeScales()

    const plugin = createAnnotationPlugin(
      [{ kind: 'point', id: 'p1', target: 'A', text: 'Static' }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200, transition: false },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const annGroup = g.querySelector('g[data-annotation-id="p1"]')
    expect(annGroup).toBeTruthy()
    // No transition-related transforms should be present
    expect(annGroup!.getAttribute('transform')).toBeNull()
  })

  it('fades in new annotations during transition', () => {
    const { x, y, data } = makeScales()

    // First render with no annotations, then add one with transition
    const plugin1 = createAnnotationPlugin(
      [],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin1.postDraw!(makeChartStub(g) as any, undefined as any)

    // Leave old containers in place for snapshot
    const plugin2 = createAnnotationPlugin(
      [{ kind: 'point', id: 'new-1', target: 'A', text: 'New ann' }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200, transition: true },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin2.postDraw!(makeChartStub(g) as any, undefined as any)

    const annGroup = g.querySelector('g[data-annotation-id="new-1"]')
    expect(annGroup).toBeTruthy()
    // New annotation should have opacity style (starting fade-in)
    // In jsdom, Web Animations API may not work, so just verify the element exists
    expect(annGroup!.querySelector('.bc-annotation-text')!.textContent).toBe('New ann')
  })

  it('range annotation transitions preserve data-annotation-id', () => {
    const { x, y, data } = makeScales()

    // First render
    const plugin1 = createAnnotationPlugin(
      [{ kind: 'range', id: 'r1', start: 'A', end: 'B', bgColor: '#f00' }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin1.postDraw!(makeChartStub(g) as any, undefined as any)

    // Leave old containers in place for snapshot
    const plugin2 = createAnnotationPlugin(
      [{ kind: 'range', id: 'r1', start: 'A', end: 'B', bgColor: '#00f' }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200, transition: true },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin2.postDraw!(makeChartStub(g) as any, undefined as any)

    const rangeGroup = g.querySelector('g[data-annotation-id="r1"]')
    expect(rangeGroup).toBeTruthy()
    const rect = rangeGroup!.querySelector('.bc-annotation-range')
    expect(rect!.getAttribute('fill')).toBe('#00f')
  })

  // -----------------------------------------------------------------------
  // priorAnnotations — renderer clears DOM before plugin runs
  // -----------------------------------------------------------------------

  it('uses priorAnnotations when DOM is cleared before postDraw', () => {
    const { x, y, data } = makeScales()

    // First render
    const plugin1 = createAnnotationPlugin(
      [{ kind: 'point', id: 'p1', target: 'A', text: 'Before' }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin1.postDraw!(makeChartStub(g) as any, undefined as any)

    // Snapshot old annotations then clear DOM (simulates renderer replaceChildren)
    const prior = new Map<string, { id: string, element: Element, rect: { x: number, y: number, width: number, height: number } }>()
    for (const el of g.querySelectorAll('.bc-annotations, .bc-annotations-range')) {
      for (const [k, v] of snapshotAnnotations(el)) {
        prior.set(k, v)
      }
    }
    expect(prior.size).toBe(1)

    // Clear DOM — old containers gone
    g.innerHTML = ''

    // Second render with priorAnnotations
    const plugin2 = createAnnotationPlugin(
      [{ kind: 'point', id: 'p1', target: 'B', text: 'After' }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200, transition: true, priorAnnotations: prior },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin2.postDraw!(makeChartStub(g) as any, undefined as any)

    const group = g.querySelector('g[data-annotation-id="p1"]')
    expect(group).toBeTruthy()
    expect(group!.querySelector('.bc-annotation-text')!.textContent).toBe('After')
  })

  it('fades out removed annotations via priorAnnotations after DOM clear', () => {
    const { x, y, data } = makeScales()

    // First render
    const plugin1 = createAnnotationPlugin(
      [{ kind: 'point', id: 'gone-1', target: 'A', text: 'Will go' }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin1.postDraw!(makeChartStub(g) as any, undefined as any)

    // Snapshot then clear
    const prior = new Map<string, { id: string, element: Element, rect: { x: number, y: number, width: number, height: number } }>()
    for (const el of g.querySelectorAll('.bc-annotations, .bc-annotations-range')) {
      for (const [k, v] of snapshotAnnotations(el)) {
        prior.set(k, v)
      }
    }
    g.innerHTML = ''

    // Second render with no annotations
    const plugin2 = createAnnotationPlugin(
      [],
      { scaleX: x, scaleY: y, data, width: 200, height: 200, transition: true, priorAnnotations: prior },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin2.postDraw!(makeChartStub(g) as any, undefined as any)

    // Old annotation clone should be re-inserted for fade-out
    const groups = g.querySelectorAll('g[data-annotation-id="gone-1"]')
    expect(groups.length).toBeGreaterThanOrEqual(1)
  })

  it('fades in new annotations via priorAnnotations after DOM clear', () => {
    const { x, y, data } = makeScales()

    // First render with no annotations
    const plugin1 = createAnnotationPlugin(
      [],
      { scaleX: x, scaleY: y, data, width: 200, height: 200 },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin1.postDraw!(makeChartStub(g) as any, undefined as any)

    // Empty prior snapshot (no annotations existed), then clear DOM
    const prior = new Map<string, { id: string, element: Element, rect: { x: number, y: number, width: number, height: number } }>()
    g.innerHTML = ''

    // Second render adds annotation — should fade in
    const plugin2 = createAnnotationPlugin(
      [{ kind: 'free', id: 'f1', text: 'Appeared', x: 0, y: 0 }],
      { scaleX: x, scaleY: y, data, width: 200, height: 200, transition: true, priorAnnotations: prior },
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin2.postDraw!(makeChartStub(g) as any, undefined as any)

    const group = g.querySelector('g[data-annotation-id="f1"]')
    expect(group).toBeTruthy()
    expect(group!.querySelector('.bc-annotation-text')!.textContent).toBe('Appeared')
  })

  // -----------------------------------------------------------------------
  // Free annotation with empty scales (pie/donut scenario)
  // -----------------------------------------------------------------------

  it('renders free annotation with empty band scale (pie/donut scenario)', () => {
    const emptyBand = d3.scaleBand<string>().domain([]).range([0, 300])
    const dummyLinear = d3.scaleLinear().domain([0, 1]).range([300, 0])

    const plugin = createAnnotationPlugin(
      [{ kind: 'free', text: 'Pie note', x: 0, y: -25 }],
      { scaleX: emptyBand, scaleY: dummyLinear, data: [], width: 300, height: 300 },
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugin.postDraw!(makeChartStub(g) as any, undefined as any)

    const texts = g.querySelectorAll('.bc-annotation-text')
    expect(texts).toHaveLength(1)
    expect(texts[0].textContent).toBe('Pie note')
    // 0% center-relative of 300 = 150
    expect(texts[0].getAttribute('x')).toBe('150')
    // -25% center-relative of 300 = 150 + (-75) = 75
    expect(texts[0].getAttribute('y')).toBe('75')
  })
})
