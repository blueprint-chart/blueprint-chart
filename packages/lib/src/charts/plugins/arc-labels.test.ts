import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import * as d3 from 'd3'
import { estimateArcLabelMargins, spreadLabels, renderInsideArcLabels, renderAutoArcLabels } from './arc-labels'
import type { ArcLabelDatum } from './arc-labels'

describe('estimateArcLabelMargins', () => {
  it('returns symmetric non-zero margins for non-empty labels', () => {
    const result = estimateArcLabelMargins(['Apples', 'Bananas', 'Cherries'], 100)
    expect(result.left).toBeGreaterThan(0)
    expect(result.right).toBeGreaterThan(0)
    expect(result.left).toBe(result.right)
    expect(result.top).toBeGreaterThanOrEqual(0)
    expect(result.bottom).toBeGreaterThanOrEqual(0)
  })

  it('returns zero margins for empty array', () => {
    const result = estimateArcLabelMargins([], 100)
    expect(result.left).toBe(0)
    expect(result.right).toBe(0)
    expect(result.top).toBe(0)
    expect(result.bottom).toBe(0)
  })

  it('margins scale with label length', () => {
    const short = estimateArcLabelMargins(['A', 'B'], 100)
    const long = estimateArcLabelMargins(['Long Label Name', 'Another Long One'], 100)
    expect(long.left).toBeGreaterThan(short.left)
  })
})

describe('spreadLabels', () => {
  it('returns empty array for empty input', () => {
    expect(spreadLabels([], -100, 100)).toEqual([])
  })

  it('clamps a single label within bounds', () => {
    expect(spreadLabels([200], -100, 100)).toEqual([100])
    expect(spreadLabels([-200], -100, 100)).toEqual([-100])
    expect(spreadLabels([50], -100, 100)).toEqual([50])
  })

  it('preserves order and does not overlap', () => {
    // Three labels all at the same Y — must be spread apart
    const result = spreadLabels([0, 0, 0], -200, 200)
    expect(result).toHaveLength(3)
    for (let i = 1; i < result.length; i++) {
      expect(result[i] - result[i - 1]).toBeGreaterThanOrEqual(28)
    }
    // Order preserved (sorted ascending)
    expect(result[0]).toBeLessThan(result[1])
    expect(result[1]).toBeLessThan(result[2])
  })

  it('does not overlap even when clamped to tight bounds', () => {
    // 5 labels in a space that can barely fit them (5 * 28 = 140, bounds = 150)
    const result = spreadLabels([-50, -50, -50, -50, -50], -75, 75)
    expect(result).toHaveLength(5)
    for (let i = 1; i < result.length; i++) {
      const gap = result[i] - result[i - 1]
      // Allow tiny floating-point slack
      expect(gap).toBeGreaterThanOrEqual(28 - 0.001)
    }
  })

  it('keeps labels close to natural positions when space allows', () => {
    const natural = [-100, 0, 100]
    const result = spreadLabels(natural, -200, 200)
    // With plenty of room, labels should stay at their natural positions
    result.forEach((y, i) => {
      expect(Math.abs(y - natural[i])).toBeLessThan(1)
    })
  })

  it('handles crowded top scenario (energy sources left side)', () => {
    // Simulate the failing case: 5 labels on the left side
    // Natural Ys for Other Renewables, Solar, Wind, Nuclear, Hydro
    const natural = [-140, -125, -95, -25, 80]
    const result = spreadLabels(natural, -157, 157)
    expect(result).toHaveLength(5)
    // No overlaps
    for (let i = 1; i < result.length; i++) {
      expect(result[i] - result[i - 1]).toBeGreaterThanOrEqual(28 - 0.001)
    }
    // All within bounds
    result.forEach((y) => {
      expect(y).toBeGreaterThanOrEqual(-157)
      expect(y).toBeLessThanOrEqual(157)
    })
  })

  it('distributes labels evenly when space is insufficient for full gap', () => {
    // 3 labels in space of 40px (need 2*28=56 but only have 40)
    // Should reduce gap proportionally to fit, not leave uneven gaps
    const result = spreadLabels([20, 20, 20], 0, 40)
    expect(result).toHaveLength(3)
    const gap1 = result[1] - result[0]
    const gap2 = result[2] - result[1]
    // Gaps should be equal (evenly distributed)
    expect(Math.abs(gap1 - gap2)).toBeLessThan(0.01)
    // Gaps should be positive (labels should not overlap)
    expect(gap1).toBeGreaterThan(0)
    // All within bounds
    expect(result[0]).toBeGreaterThanOrEqual(0)
    expect(result[2]).toBeLessThanOrEqual(40)
  })

  it('handles all labels at the same Y with a custom gap', () => {
    // 4 labels all at y=100, gap=14, bounds [0, 300]
    const result = spreadLabels([100, 100, 100, 100], 0, 300, 14)
    expect(result).toHaveLength(4)
    for (let i = 1; i < result.length; i++) {
      expect(result[i] - result[i - 1]).toBeGreaterThanOrEqual(14 - 0.001)
    }
  })

  it('all labels maintain strictly ascending order', () => {
    // Edge case: labels very close to boundary
    const result = spreadLabels([0, 0, 0], 0, 10)
    expect(result).toHaveLength(3)
    // Every label should be strictly greater than the previous
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeGreaterThan(result[i - 1])
    }
  })
})

function createSvgGroup(): d3.Selection<SVGGElement, unknown, null, undefined> {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
  const doc = dom.window.document
  const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg')
  doc.body.appendChild(svg)
  const g = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  svg.appendChild(g)
  return d3.select(g) as unknown as d3.Selection<SVGGElement, unknown, null, undefined>
}

function makePieData(values: number[], labels: string[]): ArcLabelDatum[] {
  const pie = d3.pie<number>().sort(null)
  const pieData = pie(values)
  const colors = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f']
  return pieData.map((d, i) => ({
    label: labels[i],
    value: d.data,
    startAngle: d.startAngle,
    endAngle: d.endAngle,
    color: colors[i % colors.length],
  }))
}

describe('renderInsideArcLabels', () => {
  it('creates text elements at centroids for large slices', () => {
    const g = createSvgGroup()
    const data = makePieData([50, 30, 20], ['Big', 'Med', 'Small'])
    renderInsideArcLabels(g, data, { outerRadius: 100, innerRadius: 60, chartWidth: 300, chartHeight: 300 })

    const texts = g.selectAll('.bc-arc-inside-label')
    // All three slices should be large enough (all > 0.3 rad)
    expect(texts.size()).toBeGreaterThanOrEqual(2)
  })

  it('skips slices with small angular span', () => {
    const g = createSvgGroup()
    // One huge slice and one tiny slice
    const data = makePieData([98, 2], ['Huge', 'Tiny'])
    renderInsideArcLabels(g, data, { outerRadius: 100, innerRadius: 60, chartWidth: 300, chartHeight: 300 })

    const texts = g.selectAll('.bc-arc-inside-label')
    // Tiny slice (2% ≈ 0.126 rad) should be skipped
    expect(texts.size()).toBe(1)
  })

  it('renders label and value tspans', () => {
    const g = createSvgGroup()
    const data = makePieData([100], ['Only'])
    renderInsideArcLabels(g, data, { outerRadius: 100, innerRadius: 60, chartWidth: 300, chartHeight: 300 })

    const tspans = g.selectAll('tspan')
    expect(tspans.size()).toBe(2)
  })
})

describe('renderAutoArcLabels', () => {
  it('uses inside for large slices and outline for small ones', () => {
    const g = createSvgGroup()
    // One very large slice + several small ones with long labels
    const data = makePieData([80, 5, 5, 5, 5], ['Big', 'SmallSliceAlpha', 'SmallSliceBeta', 'SmallSliceGamma', 'SmallSliceDelta'])
    renderAutoArcLabels(g, data, { outerRadius: 100, innerRadius: 60, chartWidth: 300, chartHeight: 300 })

    const el = g.node()!
    const insideCount = el.querySelectorAll('.bc-arc-inside-label').length
    const outlineCount = el.querySelectorAll('.bc-arc-label-line').length

    // Big slice should be inside
    expect(insideCount).toBeGreaterThanOrEqual(1)
    // Small slices with long labels should be outline (with leader lines)
    expect(outlineCount).toBeGreaterThanOrEqual(1)
  })

  it('falls back to all-outline when all slices are small', () => {
    const g = createSvgGroup()
    // Many small slices with long labels → all go to outline
    const data = makePieData(
      [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
      ['LongLabel1', 'LongLabel2', 'LongLabel3', 'LongLabel4', 'LongLabel5', 'LongLabel6', 'LongLabel7', 'LongLabel8', 'LongLabel9', 'LongLabel10'],
    )
    renderAutoArcLabels(g, data, { outerRadius: 50, innerRadius: 30, chartWidth: 200, chartHeight: 200 })

    const el = g.node()!
    const outlineCount = el.querySelectorAll('.bc-arc-label-line').length
    const insideCount = el.querySelectorAll('.bc-arc-inside-label').length

    // All slices should be outline (with leader lines)
    expect(outlineCount).toBeGreaterThanOrEqual(1)
    // No inside labels
    expect(insideCount).toBe(0)
  })
})
