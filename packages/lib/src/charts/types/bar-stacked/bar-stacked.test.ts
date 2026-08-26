import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './bar-stacked'
import { StackMode, ValueLabelPosition } from '../../../enums'

describe('bar-stacked', () => {
  let container: HTMLElement

  const data = {
    labels: ['Q1', 'Q2'],
    values: [],
    series: [
      { name: 'Product A', values: [10, 20] },
      { name: 'Product B', values: [15, 25] },
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

  it('renders stacked bars', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-stacked')
    // 2 labels x 2 series = 4 bars
    expect(bars).toHaveLength(4)
  })

  it('creates frame and SVG', () => {
    render(container, data)
    expect(container.querySelector('.bc-frame')).not.toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders bars with correct data-series attribute (series name)', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-stacked')
    const seriesKeys = Array.from(bars).map(b => b.getAttribute('data-series'))
    expect(seriesKeys).toContain('Product A')
    expect(seriesKeys).toContain('Product B')
  })

  it('renders bars as rect elements with bc-bar class', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-stacked')
    for (const bar of bars) {
      expect(bar.tagName.toLowerCase()).toBe('rect')
      expect(bar.classList.contains('bc-bar')).toBe(true)
    }
  })

  // ── Horizontal stacked positioning ───────────────────────────────

  it('stacks bars horizontally without overlap', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-stacked')
    // Group bars by label (via y position)
    const groups = new Map<string, { x: number, w: number }[]>()
    for (const bar of bars) {
      const yVal = bar.getAttribute('y') ?? '0'
      const xVal = parseFloat(bar.getAttribute('x') ?? '0')
      const wVal = parseFloat(bar.getAttribute('width') ?? '0')
      if (!groups.has(yVal)) {
        groups.set(yVal, [])
      }
      groups.get(yVal)!.push({ x: xVal, w: wVal })
    }
    // For each label, check that stacked bars are adjacent (not overlapping)
    for (const [, rects] of groups) {
      rects.sort((a, b) => a.x - b.x)
      for (let i = 1; i < rects.length; i++) {
        const prevRight = rects[i - 1].x + rects[i - 1].w
        expect(Math.abs(rects[i].x - prevRight)).toBeLessThan(1)
      }
    }
  })

  // ── Percent mode ─────────────────────────────────────────────────

  it('renders in percent mode when stackMode is percent', () => {
    render(container, data, { stackMode: StackMode.Percent })
    const bars = container.querySelectorAll('.bc-bar-stacked')
    expect(bars).toHaveLength(4)
  })

  it('percent mode stacks total to full chart width', () => {
    render(container, data, { stackMode: StackMode.Percent })
    const bars = container.querySelectorAll('.bc-bar-stacked')
    // Group by y position
    const groups = new Map<string, number>()
    for (const bar of bars) {
      const yVal = bar.getAttribute('y') ?? '0'
      const wVal = parseFloat(bar.getAttribute('width') ?? '0')
      groups.set(yVal, (groups.get(yVal) ?? 0) + wVal)
    }
    // All stacked rows should have the same total width
    const totals = Array.from(groups.values())
    for (let i = 1; i < totals.length; i++) {
      expect(Math.abs(totals[i] - totals[0])).toBeLessThan(1)
    }
  })

  // ── Legend ────────────────────────────────────────────────────────

  it('renders a legend by default', () => {
    render(container, data)
    const legend = container.querySelector('.bc-legend')
    expect(legend).not.toBeNull()
    const items = container.querySelectorAll('.bc-legend-item')
    expect(items).toHaveLength(2)
  })

  it('hides legend when legend option is false', () => {
    render(container, data, { legend: false })
    const legend = container.querySelector('.bc-legend')
    expect(legend).toBeNull()
  })

  // ── Colors ───────────────────────────────────────────────────────

  it('applies custom colors to bars', () => {
    render(container, data, { colors: ['#ff0000', '#00ff00'] })
    const bars = container.querySelectorAll('.bc-bar-stacked')
    const series0Fills = Array.from(bars)
      .filter(b => b.getAttribute('data-series') === 'Product A')
      .map(b => b.getAttribute('fill'))
    const series1Fills = Array.from(bars)
      .filter(b => b.getAttribute('data-series') === 'Product B')
      .map(b => b.getAttribute('fill'))
    for (const fill of series0Fills) {
      expect(fill).toBe('#ff0000')
    }
    for (const fill of series1Fills) {
      expect(fill).toBe('#00ff00')
    }
  })

  it('uses default colors when no colors option provided', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-stacked')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    for (const fill of fills) {
      expect(fill).toBeTruthy()
    }
    const series0Fills = Array.from(bars)
      .filter(b => b.getAttribute('data-series') === 'Product A')
      .map(b => b.getAttribute('fill'))
    for (const fill of series0Fills) {
      expect(fill).toBe('#4e79a7')
    }
  })

  // ── Value labels ─────────────────────────────────────────────────

  it('does not render value labels by default', () => {
    render(container, data)
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(0)
  })

  it('renders value labels when segments are wide enough', () => {
    render(container, data, { valueLabels: true })
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(4)
  })

  it('auto position moves labels outside when segment is too narrow', () => {
    const skewedData = {
      labels: ['Row'],
      values: [],
      series: [
        { name: 'Big', values: [999] },
        { name: 'Tiny', values: [1] },
      ],
    }
    render(container, skewedData, { valueLabels: true })
    const labels = container.querySelectorAll('.bc-value-label')
    // Both labels shown: Big inside, Tiny moved outside
    expect(labels).toHaveLength(2)
  })

  it('inside position hides labels when segment is too narrow', () => {
    const skewedData = {
      labels: ['Row'],
      values: [],
      series: [
        { name: 'Big', values: [999] },
        { name: 'Tiny', values: [1] },
      ],
    }
    render(container, skewedData, { valueLabels: true, valueLabelPosition: ValueLabelPosition.Inside })
    const labels = container.querySelectorAll('.bc-value-label')
    // Both labels exist but the narrow one is hidden via opacity attribute
    expect(labels).toHaveLength(2)
    const visible = Array.from(labels).filter(l => l.getAttribute('opacity') !== '0')
    expect(visible).toHaveLength(1)
    expect(visible[0].textContent).toBe('999')
  })

  it('outside position places visible labels at right edge of segment with start anchor', () => {
    render(container, data, { valueLabels: true, valueLabelPosition: ValueLabelPosition.Outside })
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(4)
    // Visible outside labels (i.e. those that fit) anchor at 'start' against
    // their segment's right edge. Labels that would clip the chart right edge
    // are suppressed (see overflow tests) — only check the visible ones here.
    const visible = Array.from(labels).filter(l => l.getAttribute('opacity') !== '0')
    expect(visible.length).toBeGreaterThan(0)
    for (const label of visible) {
      expect(label.getAttribute('text-anchor')).toBe('start')
      expect(label.getAttribute('fill')).toBe('currentColor')
    }
  })

  it('outside position hides labels that overflow past the next segment', () => {
    // A's label "50" sits on B (narrow, ~10px) → overflows → hidden via opacity
    // B's label "10" sits on C (wide) → fits → shown
    // C is last → its label "940" sits past the chart right edge → hidden
    const overflowData = {
      labels: ['Row'],
      values: [],
      series: [
        { name: 'A', values: [50] },
        { name: 'B', values: [10] },
        { name: 'C', values: [940] },
      ],
    }
    render(container, overflowData, { valueLabels: true, valueLabelPosition: ValueLabelPosition.Outside })
    const labels = container.querySelectorAll('.bc-value-label')
    const visible = Array.from(labels).filter(l => l.getAttribute('opacity') !== '0')
    const visibleTexts = visible.map(l => l.textContent)
    // A's label overflows the narrow B segment → hidden via opacity attribute
    expect(visibleTexts).not.toContain('50')
    // B sits over the wide C segment → fits → shown
    expect(visibleTexts).toContain('10')
  })

  it('uses contrast text color for inside value labels', () => {
    render(container, data, { valueLabels: true, colors: ['#000000', '#ffffff'] })
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels.length).toBeGreaterThan(0)
    for (const label of labels) {
      // Inside labels use contrast color, not currentColor
      expect(label.getAttribute('fill')).not.toBe('currentColor')
    }
  })

  it('auto position uses contrast color for inside labels and currentColor for outside', () => {
    // Two rows so the auto-positioned narrow last segments have room to the
    // right of their stack: the chart's overall niced max sits well past the
    // narrow row's y1, leaving outside-label space inside the chart area.
    const skewedData = {
      labels: ['Wide row', 'Narrow row'],
      values: [],
      series: [
        { name: 'Big', values: [999, 50] },
        { name: 'Tiny', values: [1, 5] },
      ],
    }
    render(container, skewedData, { valueLabels: true, colors: ['#000000', '#ff0000'] })
    const labels = container.querySelectorAll('.bc-value-label')
    const visible = Array.from(labels).filter(l => l.getAttribute('opacity') !== '0')
    const fills = visible.map(l => l.getAttribute('fill'))
    // At least one inside (contrast colour) and one outside (currentColor).
    expect(fills).toContain('currentColor')
    expect(fills.filter(f => f !== 'currentColor').length).toBeGreaterThan(0)
  })

  it('auto position hides narrow inner segments to avoid overlap', () => {
    const threeSegData = {
      labels: ['Row'],
      values: [],
      series: [
        { name: 'A', values: [100] },
        { name: 'B', values: [1] },
        { name: 'C', values: [100] },
      ],
    }
    render(container, threeSegData, { valueLabels: true })
    const labels = container.querySelectorAll('.bc-value-label')
    const visible = Array.from(labels).filter(l => l.getAttribute('opacity') !== '0')
    const visibleTexts = visible.map(l => l.textContent)
    // A and C fit inside; B is narrow inner segment → hidden via opacity
    expect(visibleTexts).toContain('100')
    expect(visibleTexts).not.toContain('1')
    expect(visible).toHaveLength(2)
  })

  // ── Transition ───────────────────────────────────────────────────

  it('supports transition parameter on second render', () => {
    render(container, data)
    const data2 = {
      labels: ['Q1', 'Q2', 'Q3'],
      values: [],
      series: [
        { name: 'Product A', values: [12, 22, 32] },
        { name: 'Product B', values: [18, 28, 38] },
      ],
    }
    render(container, data2, {}, true)
    const bars = container.querySelectorAll('.bc-bar-stacked')
    expect(bars.length).toBeGreaterThanOrEqual(6)
  })

  it('replaces container content on transition render', () => {
    render(container, data)
    render(container, data, {}, true)
    expect(container.querySelectorAll('.bc-frame')).toHaveLength(1)
    expect(container.querySelectorAll('svg')).toHaveLength(2)
  })

  // ── Sort mode ────────────────────────────────────────────────────

  it('sorts labels by total when sortMode is total', () => {
    const unsortedData = {
      labels: ['Low', 'High', 'Mid'],
      values: [],
      series: [
        { name: 'A', values: [1, 100, 50] },
        { name: 'B', values: [2, 200, 100] },
      ],
    }
    render(container, unsortedData, { sortMode: 'total' })
    const tickLabels = container.querySelectorAll('.bc-axis-vertical .tick text')
    const labelTexts = Array.from(tickLabels).map(t => t.textContent)
    expect(labelTexts[0]).toBe('High')
    expect(labelTexts[1]).toBe('Mid')
    expect(labelTexts[2]).toBe('Low')
  })

  // ── Clip path ────────────────────────────────────────────────────

  it('clips bars to the chart area', () => {
    render(container, data)
    const clipPath = container.querySelector('clipPath')
    expect(clipPath).not.toBeNull()
    const barGroup = clipPath!.id
      ? container.querySelector(`[clip-path="url(#${clipPath!.id})"]`)
      : null
    expect(barGroup).not.toBeNull()
    expect(barGroup!.querySelector('.bc-bar')).not.toBeNull()
  })

  // ── Crosshair ────────────────────────────────────────────────────

  it('adds crosshair lines when crosshair is true', () => {
    render(container, data, { crosshair: true })
    const vLine = container.querySelector('.bc-crosshair-v')
    const hLine = container.querySelector('.bc-crosshair-h')
    expect(vLine).not.toBeNull()
    expect(hLine).not.toBeNull()
  })

  // ── Tooltips ─────────────────────────────────────────────────────

  it('creates tooltip element when tooltips is true', () => {
    render(container, data, { tooltips: true })
    const tooltip = document.querySelector('.bc-tooltip')
    expect(tooltip).not.toBeNull()
    tooltip?.remove()
  })

  // ── Series overrides ─────────────────────────────────────────────

  it('applies series color override', () => {
    render(container, data, {
      seriesOverrides: [{ name: 'Product A', color: '#abcdef' }],
    })
    const bars = container.querySelectorAll('.bc-bar-stacked')
    const series0Bars = Array.from(bars).filter(b => b.getAttribute('data-series') === 'Product A')
    for (const bar of series0Bars) {
      expect(bar.getAttribute('fill')).toBe('#abcdef')
    }
  })

  it('hides series when hidden override is set', () => {
    render(container, data, {
      seriesOverrides: [{ name: 'Product B', hidden: true }],
    })
    const bars = container.querySelectorAll('.bc-bar-stacked')
    expect(bars).toHaveLength(2)
  })

  it('renders value labels as share-of-column percentages with valueLabels="percent"', () => {
    const percentData = {
      labels: ['Col'],
      values: [],
      series: [
        { name: 'Series A', values: [25] },
        { name: 'Series B', values: [75] },
      ],
    }
    render(container, percentData, { valueLabels: 'percent' })
    const texts = Array.from(container.querySelectorAll('.bc-value-label')).map(el => el.textContent)
    expect(texts).toEqual(expect.arrayContaining(['25%', '75%']))
  })

  it('applies opacity override to series', () => {
    render(container, data, {
      seriesOverrides: [{ name: 'Product A', opacity: 0.5 }],
    })
    const bars = container.querySelectorAll('.bc-bar-stacked')
    const series0Bars = Array.from(bars).filter(b => b.getAttribute('data-series') === 'Product A')
    for (const bar of series0Bars) {
      expect(bar.getAttribute('fill-opacity')).toBe('0.5')
    }
  })

  // ── Three series ─────────────────────────────────────────────────

  it('handles three series correctly', () => {
    const threeSeriesData = {
      labels: ['Q1', 'Q2'],
      values: [],
      series: [
        { name: 'A', values: [10, 20] },
        { name: 'B', values: [15, 25] },
        { name: 'C', values: [5, 30] },
      ],
    }
    render(container, threeSeriesData)
    const bars = container.querySelectorAll('.bc-bar-stacked')
    expect(bars).toHaveLength(6)
    const items = container.querySelectorAll('.bc-legend-item')
    expect(items).toHaveLength(3)
  })

  // ── Clip path determinism (L2) ───────────────────────────────────

  it('reuses a single clipPath across repeated renders to the same container', () => {
    for (let i = 0; i < 5; i++) {
      render(container, data)
    }
    const clips = container.querySelectorAll('clipPath')
    expect(clips).toHaveLength(1)
  })

  // ── Legend ↔ bar series-key parity (L8) ──────────────────────────

  // ── Colorize ─────────────────────────────────────────────────────

  it('applies colorize to the targeted series', () => {
    render(container, data, { colorizes: [{ target: 'Product A', color: '#ff0000' }] })
    const bars = Array.from(container.querySelectorAll('.bc-bar-stacked'))
    const a = bars.find(b => b.getAttribute('data-series') === 'Product A')
    const other = bars.find(b => b.getAttribute('data-series') === 'Product B')
    expect(a?.getAttribute('fill')).toBe('#ff0000')
    expect(other?.getAttribute('fill')).not.toBe('#ff0000')
  })

  // ── Highlight / dimming ──────────────────────────────────────────

  it('dims non-highlighted series segments to 0.35', () => {
    render(container, data, { highlights: [{ target: 'Product A' }] })
    const bars = Array.from(container.querySelectorAll('.bc-bar-stacked'))
    const a = bars.find(b => b.getAttribute('data-series') === 'Product A')
    const other = bars.find(b => b.getAttribute('data-series') === 'Product B')
    expect(a?.getAttribute('opacity')).toBe('1')
    expect(other?.getAttribute('opacity')).toBe('0.35')
  })

  // ── Legend ↔ bar series-key parity (L8) ──────────────────────────

  it('legend data-series matches bar data-series so highlighting picks the right bars when a series is hidden', () => {
    const threeSeriesData = {
      labels: ['Q1', 'Q2'],
      values: [],
      series: [
        { name: 'A', values: [10, 20] },
        { name: 'B', values: [15, 25] },
        { name: 'C', values: [5, 30] },
      ],
    }
    // Hide series "B" — legend should show only A and C, both with names as keys.
    render(container, threeSeriesData, {
      seriesOverrides: [{ name: 'B', hidden: true }],
    })

    const legendItems = container.querySelectorAll('.bc-legend-item')
    const legendKeys = Array.from(legendItems).map(i => i.getAttribute('data-series'))
    expect(legendKeys).toEqual(['A', 'C'])

    // The bars that remain are A and C; data-series keys are the series names,
    // NOT the original all-series indices (which would be 0 and 2).
    const bars = container.querySelectorAll('.bc-bar-stacked')
    const barKeys = new Set(Array.from(bars).map(b => b.getAttribute('data-series')))
    expect(barKeys).toEqual(new Set(['A', 'C']))

    // Hovering the "C" legend item would match C-bars by key, not by
    // positional index (which under the old code would have collided with B).
    const cLegend = Array.from(legendItems).find(i => i.getAttribute('data-series') === 'C')!
    expect(cLegend).toBeDefined()
    const cBars = Array.from(bars).filter(b => b.getAttribute('data-series') === cLegend.getAttribute('data-series'))
    expect(cBars).toHaveLength(2)
  })

  // ── Percent stacking with negative values (audit G3) ──

  describe('percent stacking with a negative value', () => {
    const diverging = {
      labels: ['North', 'South'],
      values: [],
      series: [
        { name: 'Alpha', values: [31, 31] },
        { name: 'Beta', values: [44, -44] },
      ],
    }

    it('emits no negative rect width', () => {
      render(container, diverging, { stackMode: StackMode.Percent })
      const widths = Array.from(container.querySelectorAll('.bc-bar-stacked')).map(r => Number(r.getAttribute('width')))
      expect(widths).toHaveLength(4)
      expect(widths.every(w => w >= 0)).toBe(true)
    })

    it('keeps every segment inside the plot', () => {
      render(container, diverging, { stackMode: StackMode.Percent })
      const rects = Array.from(container.querySelectorAll('.bc-bar-stacked'))
      expect(rects.every(r => Number(r.getAttribute('x')) >= 0)).toBe(true)
    })

    it('labels no segment above 100%', () => {
      render(container, diverging, { stackMode: StackMode.Percent, valueLabels: true })
      const percents = Array.from(container.querySelectorAll('.bc-value-label'))
        .map(t => Number((t.textContent ?? '').replace('%', '')))
      expect(percents.every(p => Math.abs(p) <= 100)).toBe(true)
    })

    it('labels the negative segment with a negative percentage', () => {
      render(container, diverging, { stackMode: StackMode.Percent, valueLabels: true })
      const texts = Array.from(container.querySelectorAll('.bc-value-label')).map(t => t.textContent)
      expect(texts).toContain('-59%')
    })
  })

  describe('categoryLabelLine on a dense chart', () => {
    it('keeps every bar visible', () => {
      const labels = Array.from({ length: 19 }, (_, i) => `Category ${String(i + 1).padStart(2, '0')}`)
      render(container, {
        labels,
        values: [],
        series: [{ name: 'S1', values: labels.map(() => 10) }],
      }, { categoryLabelLine: true })
      const heights = Array.from(container.querySelectorAll('.bc-bar-stacked')).map(r => Number(r.getAttribute('height')))
      expect(heights).toHaveLength(19)
      expect(heights.every(h => h > 0)).toBe(true)
    })
  })
})
