import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './area-stacked'
import { StackMode, SortDirection } from '../../../enums'

describe('area-stacked chart', () => {
  let container: HTMLElement

  const data = {
    labels: ['Jan', 'Feb', 'Mar'],
    values: [0, 0, 0],
    series: [
      { name: 'Product A', values: [10, 20, 15] },
      { name: 'Product B', values: [5, 10, 8] },
      { name: 'Product C', values: [3, 7, 12] },
    ],
  }

  beforeEach(() => {
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ── Basic rendering ──────────────────────────────────────────────

  it('renders one area path per series', () => {
    render(container, data)
    const areas = container.querySelectorAll('.bc-area')
    expect(areas).toHaveLength(3)
  })

  it('renders one line path per series', () => {
    render(container, data)
    const lines = container.querySelectorAll('.bc-line')
    expect(lines).toHaveLength(3)
  })

  it('creates frame and SVG', () => {
    render(container, data)
    expect(container.querySelector('.bc-frame')).not.toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders a clip path to constrain chart content', () => {
    render(container, data)
    const clipPath = container.querySelector('clipPath')
    expect(clipPath).not.toBeNull()
    const clipped = container.querySelector(`[clip-path="url(#${clipPath!.id})"]`)
    expect(clipped).not.toBeNull()
    expect(clipped!.querySelectorAll('.bc-area').length).toBe(3)
  })

  it('each area has a d attribute with path data', () => {
    render(container, data)
    const areas = container.querySelectorAll('.bc-area')
    areas.forEach((area) => {
      expect(area.getAttribute('d')).toBeTruthy()
    })
  })

  it('each area has a data-series attribute', () => {
    render(container, data)
    const areas = container.querySelectorAll('.bc-area')
    areas.forEach((area) => {
      expect(area.getAttribute('data-series')).not.toBeNull()
    })
  })

  // ── Stacked values ───────────────────────────────────────────────

  it('areas do not have the same path (they are stacked)', () => {
    render(container, data)
    const areas = container.querySelectorAll('.bc-area')
    const paths = Array.from(areas).map(a => a.getAttribute('d'))
    // All three paths should be different since they are stacked at different baselines
    const unique = new Set(paths)
    expect(unique.size).toBe(3)
  })

  it('line edges trace the top of each stacked area', () => {
    render(container, data)
    const lines = container.querySelectorAll('.bc-line')
    lines.forEach((line) => {
      expect(line.getAttribute('d')).toBeTruthy()
      expect(line.getAttribute('fill')).toBe('none')
    })
  })

  // ── Percent mode ─────────────────────────────────────────────────

  it('renders in percent mode when stackMode=percent', () => {
    render(container, data, { stackMode: StackMode.Percent })
    const areas = container.querySelectorAll('.bc-area')
    expect(areas).toHaveLength(3)
  })

  it('percent mode areas have different paths than normal mode', () => {
    render(container, data)
    const normalPaths = Array.from(container.querySelectorAll('.bc-area')).map(a => a.getAttribute('d'))

    const container2 = document.createElement('div')
    document.body.appendChild(container2)
    render(container2, data, { stackMode: StackMode.Percent })
    const percentPaths = Array.from(container2.querySelectorAll('.bc-area')).map(a => a.getAttribute('d'))

    // At least one path should differ between normal and percent mode
    const anyDifference = normalPaths.some((p, i) => p !== percentPaths[i])
    expect(anyDifference).toBe(true)
  })

  // ── Colors ───────────────────────────────────────────────────────

  it('applies default colors to areas', () => {
    render(container, data)
    const areas = container.querySelectorAll('.bc-area')
    expect(areas[0].getAttribute('fill')).toBe('#4e79a7')
    expect(areas[1].getAttribute('fill')).toBe('#f28e2b')
    expect(areas[2].getAttribute('fill')).toBe('#e15759')
  })

  it('applies custom colors', () => {
    render(container, data, { colors: ['#ff0000', '#00ff00', '#0000ff'] })
    const areas = container.querySelectorAll('.bc-area')
    expect(areas[0].getAttribute('fill')).toBe('#ff0000')
    expect(areas[1].getAttribute('fill')).toBe('#00ff00')
    expect(areas[2].getAttribute('fill')).toBe('#0000ff')
  })

  // ── Area opacity ─────────────────────────────────────────────────

  it('areas have default opacity of 0.85', () => {
    render(container, data)
    const area = container.querySelector('.bc-area')
    expect(area?.getAttribute('opacity')).toBe('0.85')
  })

  it('areas use custom areaFillOpacity', () => {
    render(container, data, { areaFillOpacity: 0.5 })
    const area = container.querySelector('.bc-area')
    expect(area?.getAttribute('opacity')).toBe('0.5')
  })

  // ── Legend ───────────────────────────────────────────────────────

  it('renders a legend by default', () => {
    render(container, data)
    const legend = container.querySelector('.bc-legend')
    expect(legend).not.toBeNull()
  })

  it('hides legend when legend=false', () => {
    render(container, data, { legend: false })
    const legend = container.querySelector('.bc-legend')
    expect(legend).toBeNull()
  })

  // ── Interpolation ────────────────────────────────────────────────

  it('changes area path when interpolation differs', () => {
    render(container, data)
    const defaultD = container.querySelector('.bc-area')?.getAttribute('d')

    const container2 = document.createElement('div')
    document.body.appendChild(container2)
    render(container2, data, { interpolation: 'step' })
    const stepD = container2.querySelector('.bc-area')?.getAttribute('d')

    expect(defaultD).not.toBe(stepD)
  })

  // ── Tooltips / crosshair ─────────────────────────────────────────

  it('creates proximity overlay when tooltips=true', () => {
    render(container, data, { tooltips: true })
    expect(container.querySelector('.bc-proximity-overlay')).not.toBeNull()
  })

  it('creates crosshair lines when crosshair=true', () => {
    render(container, data, { crosshair: true })
    const crosshairs = container.querySelectorAll('.bc-crosshair')
    expect(crosshairs.length).toBeGreaterThan(0)
  })

  it('does not create proximity overlay by default', () => {
    render(container, data)
    expect(container.querySelector('.bc-proximity-overlay')).toBeNull()
  })

  // ── Transitions ──────────────────────────────────────────────────

  it('supports transition parameter on second render', () => {
    render(container, data)
    const newData = {
      ...data,
      series: [
        { name: 'Product A', values: [20, 10, 25] },
        { name: 'Product B', values: [8, 15, 5] },
        { name: 'Product C', values: [12, 3, 7] },
      ],
    }
    render(container, newData, {}, true)
    const areas = container.querySelectorAll('.bc-area')
    expect(areas).toHaveLength(3)
  })

  it('caches chart type as area-stacked for transition', () => {
    render(container, data)
    render(container, data, {}, true)
    const areas = container.querySelectorAll('.bc-area')
    expect(areas).toHaveLength(3)
  })

  // ── Two-series data ──────────────────────────────────────────────

  it('works with two series', () => {
    const twoSeries = {
      labels: ['A', 'B'],
      values: [0, 0],
      series: [
        { name: 'X', values: [10, 20] },
        { name: 'Y', values: [5, 15] },
      ],
    }
    render(container, twoSeries)
    expect(container.querySelectorAll('.bc-area')).toHaveLength(2)
    expect(container.querySelectorAll('.bc-line')).toHaveLength(2)
  })

  // ── Frame options ────────────────────────────────────────────────

  it('renders frame title', () => {
    render(container, data, { frame: { title: 'Stacked Revenue' } })
    const title = container.querySelector('.bc-frame-title')
    expect(title).not.toBeNull()
    expect(title?.textContent).toBe('Stacked Revenue')
  })

  // ── Edge padding ───────────────────────────────────────────────

  it('removes edge padding when edgePadding=false', () => {
    render(container, data, { edgePadding: false })
    const areas = container.querySelectorAll('.bc-area')
    expect(areas).toHaveLength(3)
    // Path should start at x=0 (no padding)
    const d = areas[0]?.getAttribute('d') ?? ''
    const firstMove = d.match(/^M([\d.]+)/)
    expect(firstMove).not.toBeNull()
    expect(parseFloat(firstMove![1])).toBe(0)
  })

  // ── Horizontal axis range ─────────────────────────────────────

  it('filters labels by horizontal axis range', () => {
    const yearData = {
      labels: ['2000', '2005', '2010', '2015', '2020'],
      values: [0, 0, 0, 0, 0],
      series: [
        { name: 'A', values: [10, 20, 30, 25, 15] },
        { name: 'B', values: [5, 15, 25, 20, 10] },
      ],
    }
    render(container, yearData, { horizontalAxis: { range: { min: new Date('2010').getTime() } } })
    const ticks = container.querySelectorAll('.bc-axis-horizontal .tick')
    const tickLabels = Array.from(ticks).map(t => t.textContent?.trim())
    expect(tickLabels).not.toContain('2000')
    expect(tickLabels).toContain('2010')
  })

  // ── Direct labelling vs legend ──────────────────────────────────

  it('shows legend (not direct labels) when legend=true and directLabelling=auto', () => {
    render(container, data, { legend: true, directLabelling: 'auto' })
    const legend = container.querySelector('.bc-legend')
    expect(legend).not.toBeNull()
    const directLabels = container.querySelectorAll('.bc-direct-label')
    expect(directLabels).toHaveLength(0)
  })

  it('shows direct labels when directLabelling=auto and legend is not explicitly true', () => {
    render(container, data, { directLabelling: 'auto' })
    const directLabels = container.querySelectorAll('.bc-direct-label')
    expect(directLabels).toHaveLength(3)
    const legend = container.querySelector('.bc-legend')
    expect(legend).toBeNull()
  })

  it('shows direct labels when directLabelling is explicitly true even with legend=true', () => {
    render(container, data, { legend: true, directLabelling: true })
    const directLabels = container.querySelectorAll('.bc-direct-label')
    expect(directLabels).toHaveLength(3)
  })

  // ── Direct label collision avoidance ────────────────────────────

  it('direct labels do not overlap when stacked series have similar midpoints', () => {
    // When series have small values, their stacked midpoints are close together
    const closeData = {
      labels: ['Jan', 'Feb', 'Mar'],
      values: [0, 0, 0],
      series: [
        { name: 'A', values: [1, 2, 1] },
        { name: 'B', values: [1, 2, 1] },
        { name: 'C', values: [1, 2, 1] },
      ],
    }
    render(container, closeData, { directLabelling: true })
    const labels = container.querySelectorAll('.bc-direct-label')
    expect(labels).toHaveLength(3)
    const ys = Array.from(labels).map(el => parseFloat(el.getAttribute('y')!)).sort((a, b) => a - b)
    for (let i = 1; i < ys.length; i++) {
      expect(ys[i] - ys[i - 1]).toBeGreaterThanOrEqual(1)
    }
  })

  // ── Unstacked mode ───────────────────────────────────────────────

  it('renders areas from y=0 when stacked=false', () => {
    render(container, data, { stacked: false })
    const areas = container.querySelectorAll('.bc-area')
    expect(areas).toHaveLength(3)
    areas.forEach(area => expect(area.getAttribute('d')).toBeTruthy())
  })

  it('unstacked areas have different paths than stacked areas', () => {
    render(container, data)
    const stackedPaths = Array.from(container.querySelectorAll('.bc-area')).map(a => a.getAttribute('d'))

    const container2 = document.createElement('div')
    document.body.appendChild(container2)
    render(container2, data, { stacked: false })
    const unstackedPaths = Array.from(container2.querySelectorAll('.bc-area')).map(a => a.getAttribute('d'))

    const anyDifference = stackedPaths.some((p, i) => p !== unstackedPaths[i])
    expect(anyDifference).toBe(true)
  })

  // ── stackPercent option ──────────────────────────────────────────

  it('renders in percent mode when stackPercent=true', () => {
    render(container, data, { stackPercent: true })
    const areas = container.querySelectorAll('.bc-area')
    expect(areas).toHaveLength(3)
  })

  it('stackPercent=true produces different paths than normal stacking', () => {
    render(container, data)
    const normalPaths = Array.from(container.querySelectorAll('.bc-area')).map(a => a.getAttribute('d'))

    const container2 = document.createElement('div')
    document.body.appendChild(container2)
    render(container2, data, { stackPercent: true })
    const percentPaths = Array.from(container2.querySelectorAll('.bc-area')).map(a => a.getAttribute('d'))

    const anyDifference = normalPaths.some((p, i) => p !== percentPaths[i])
    expect(anyDifference).toBe(true)
  })

  it('stackPercent=true and stackMode=percent produce equivalent results', () => {
    const container2 = document.createElement('div')
    document.body.appendChild(container2)
    render(container, data, { stackPercent: true })
    render(container2, data, { stackMode: StackMode.Percent })

    const pathsA = Array.from(container.querySelectorAll('.bc-area')).map(a => a.getAttribute('d'))
    const pathsB = Array.from(container2.querySelectorAll('.bc-area')).map(a => a.getAttribute('d'))
    expect(pathsA).toEqual(pathsB)
  })

  // ── Sort areas ───────────────────────────────────────────────────

  it('areaSortMode=none keeps original series order', () => {
    render(container, data, { areaSortMode: SortDirection.None })
    const areas = container.querySelectorAll('.bc-area')
    // Default colors map to original series order
    expect(areas[0].getAttribute('fill')).toBe('#4e79a7') // Product A (index 0)
    expect(areas[1].getAttribute('fill')).toBe('#f28e2b') // Product B (index 1)
    expect(areas[2].getAttribute('fill')).toBe('#e15759') // Product C (index 2)
  })

  it('areaSortMode=ascending places smallest-total series at bottom of stack', () => {
    // Totals: Product A=45, Product B=23, Product C=22
    // Ascending: C (22) first (bottom), B (23), A (45) last (top)
    // Colors derive from original series index: A=#4e79a7, B=#f28e2b, C=#e15759
    render(container, data, { areaSortMode: SortDirection.Ascending })
    const areas = container.querySelectorAll('.bc-area')
    expect(areas).toHaveLength(3)
    // Bottom area should be Product C (smallest total, index 2 → #e15759)
    expect(areas[0].getAttribute('fill')).toBe('#e15759')
    // Top area should be Product A (largest total, index 0 → #4e79a7)
    expect(areas[2].getAttribute('fill')).toBe('#4e79a7')
  })

  it('areaSortMode=descending places largest-total series at bottom of stack', () => {
    // Descending: A (45) first (bottom), B (23), C (22) last (top)
    render(container, data, { areaSortMode: SortDirection.Descending })
    const areas = container.querySelectorAll('.bc-area')
    expect(areas).toHaveLength(3)
    // Bottom area should be Product A (largest total, index 0 → #4e79a7)
    expect(areas[0].getAttribute('fill')).toBe('#4e79a7')
    // Top area should be Product C (smallest total, index 2 → #e15759)
    expect(areas[2].getAttribute('fill')).toBe('#e15759')
  })

  it('ascending and descending sort produce different stacking paths', () => {
    render(container, data, { areaSortMode: SortDirection.Ascending })
    const ascPaths = Array.from(container.querySelectorAll('.bc-area')).map(a => a.getAttribute('d'))

    const container2 = document.createElement('div')
    document.body.appendChild(container2)
    render(container2, data, { areaSortMode: SortDirection.Descending })
    const descPaths = Array.from(container2.querySelectorAll('.bc-area')).map(a => a.getAttribute('d'))

    // Paths should differ because the stacking order is reversed
    const anyDifference = ascPaths.some((p, i) => p !== descPaths[i])
    expect(anyDifference).toBe(true)
  })

  // ── Area lines ───────────────────────────────────────────────────

  it('hides line edges when areaLines=false', () => {
    render(container, data, { areaLines: false })
    const lines = container.querySelectorAll('.bc-line')
    lines.forEach(line => expect(line.getAttribute('display')).toBe('none'))
  })

  it('shows line edges by default (areaLines unset)', () => {
    render(container, data)
    const lines = container.querySelectorAll('.bc-line')
    lines.forEach(line => expect(line.getAttribute('display')).toBeNull())
  })

  it('shows line edges when areaLines=true', () => {
    render(container, data, { areaLines: true })
    const lines = container.querySelectorAll('.bc-line')
    lines.forEach(line => expect(line.getAttribute('display')).toBeNull())
  })

  // ── Edge cases ───────────────────────────────────────────────────

  it('handles empty series array gracefully', () => {
    render(container, { labels: ['A', 'B'], values: [0, 0], series: [] })
    const areas = container.querySelectorAll('.bc-area')
    expect(areas).toHaveLength(0)
  })

  it('renders without options argument', () => {
    render(container, data)
    expect(container.querySelectorAll('.bc-area').length).toBe(3)
  })

  // ── Colorizes ───────────────────────────────────────────────────

  it('dims non-highlighted series when highlights are present', () => {
    render(container, data, {
      highlights: [{ target: 'Product A' }],
    })
    const areas = container.querySelectorAll('.bc-area')
    expect(areas).toHaveLength(3)
    // Product A is highlighted — should have full opacity
    expect(areas[0].getAttribute('opacity')).toBe('0.85')
    // Product B and C are not highlighted — should be dimmed
    expect(areas[1].getAttribute('opacity')).toBe('0.3')
    expect(areas[2].getAttribute('opacity')).toBe('0.3')
  })

  it('dims non-highlighted line edges when highlights are present', () => {
    render(container, data, {
      highlights: [{ target: 'Product B' }],
    })
    const lines = container.querySelectorAll('.bc-line')
    expect(lines).toHaveLength(3)
    expect(lines[0].getAttribute('opacity')).toBe('0.3')
    expect(lines[1].getAttribute('opacity')).toBe('1')
    expect(lines[2].getAttribute('opacity')).toBe('0.3')
  })

  it('does not dim when no highlights are present', () => {
    render(container, data)
    const areas = container.querySelectorAll('.bc-area')
    // All areas should have the default opacity (not 0.3)
    for (const area of areas) {
      expect(area.getAttribute('opacity')).toBe('0.85')
    }
  })

  // ── Lifecycle: proximity tooltip + clipPath de-duplication ──────

  describe('lifecycle', () => {
    beforeEach(() => {
      // Earlier tests don't tidy up body-level tooltips; clear them so the
      // assertions below measure only what this test produces.
      document.querySelectorAll('.bc-tooltip').forEach(el => el.remove())
    })

    it('keeps a single body-level tooltip across 5 renders against the same container', () => {
      for (let i = 0; i < 5; i++) {
        render(container, data, { tooltips: true })
      }
      expect(document.querySelectorAll('.bc-tooltip')).toHaveLength(1)
    })

    it('keeps a single clipPath in <defs> across 5 renders against the same container', () => {
      for (let i = 0; i < 5; i++) {
        render(container, data, { tooltips: true })
      }
      const svg = container.querySelector('svg')!
      expect(svg.querySelectorAll('defs > clipPath')).toHaveLength(1)
    })
  })
})
