import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './area-stacked'

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
    render(container, data, { stackMode: 'percent' })
    const areas = container.querySelectorAll('.bc-area')
    expect(areas).toHaveLength(3)
  })

  it('percent mode areas have different paths than normal mode', () => {
    render(container, data)
    const normalPaths = Array.from(container.querySelectorAll('.bc-area')).map(a => a.getAttribute('d'))

    const container2 = document.createElement('div')
    document.body.appendChild(container2)
    render(container2, data, { stackMode: 'percent' })
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

  // ── Highlights ───────────────────────────────────────────────────

  it('dims non-highlighted series when highlights are present', () => {
    render(container, data, {
      highlights: [{ target: 'Product A', color: '#ff0000' }],
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
      highlights: [{ target: 'Product B', color: '#00ff00' }],
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
})
