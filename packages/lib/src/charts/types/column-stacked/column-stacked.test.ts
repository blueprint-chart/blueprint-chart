import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './column-stacked'
import { StackMode, LabelRotation, ValueLabelPosition } from '../../../enums'
import { wcagContrastRatio, adjustColorsForBackground } from '../../contrast'
import { listPalettes, resolvePalette } from '../../palettes'

describe('column-stacked', () => {
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

  it('renders bars with correct data-series attribute', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-stacked')
    const seriesIndices = Array.from(bars).map(b => b.getAttribute('data-series'))
    expect(seriesIndices).toContain('Product A')
    expect(seriesIndices).toContain('Product B')
  })

  it('renders bars as rect elements with bc-bar class', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-stacked')
    for (const bar of bars) {
      expect(bar.tagName.toLowerCase()).toBe('rect')
      expect(bar.classList.contains('bc-bar')).toBe(true)
    }
  })

  // ── Stacked positioning ──────────────────────────────────────────

  it('stacks bars vertically without overlap', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-stacked')
    // Group bars by label (via x position)
    const groups = new Map<string, { y: number, h: number }[]>()
    for (const bar of bars) {
      const xVal = bar.getAttribute('x') ?? '0'
      const yVal = parseFloat(bar.getAttribute('y') ?? '0')
      const hVal = parseFloat(bar.getAttribute('height') ?? '0')
      if (!groups.has(xVal)) {
        groups.set(xVal, [])
      }
      groups.get(xVal)!.push({ y: yVal, h: hVal })
    }
    // For each label, check that stacked bars are adjacent (not overlapping)
    for (const [, rects] of groups) {
      rects.sort((a, b) => a.y - b.y)
      for (let i = 1; i < rects.length; i++) {
        const prevBottom = rects[i - 1].y + rects[i - 1].h
        // The next rect's top (y) should be at or very close to the previous bottom
        expect(Math.abs(rects[i].y - prevBottom)).toBeLessThan(1)
      }
    }
  })

  // ── Percent mode ─────────────────────────────────────────────────

  it('renders in percent mode when stackMode is percent', () => {
    render(container, data, { stackMode: StackMode.Percent })
    const bars = container.querySelectorAll('.bc-bar-stacked')
    expect(bars).toHaveLength(4)
  })

  it('percent mode stacks total to full chart height', () => {
    render(container, data, { stackMode: StackMode.Percent })
    const bars = container.querySelectorAll('.bc-bar-stacked')
    // Group by x position
    const groups = new Map<string, number>()
    for (const bar of bars) {
      const xVal = bar.getAttribute('x') ?? '0'
      const hVal = parseFloat(bar.getAttribute('height') ?? '0')
      groups.set(xVal, (groups.get(xVal) ?? 0) + hVal)
    }
    // All stacked columns should have the same total height
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

  it('renders value labels when valueLabels is true', () => {
    render(container, data, { valueLabels: true })
    const labels = container.querySelectorAll('.bc-value-label')
    // One label per stacked segment = 4
    expect(labels).toHaveLength(4)
  })

  it('formats value labels with the vertical number format', () => {
    render(container, data, { valueLabels: true, verticalAxis: { numberFormat: '$|,.1f|' } })
    const texts = Array.from(container.querySelectorAll('.bc-value-label')).map(l => l.textContent)
    expect(texts).toEqual(expect.arrayContaining(['$10.0', '$20.0', '$15.0', '$25.0']))
  })

  describe('showTotal', () => {
    const totals = () => Array.from(container.querySelectorAll('.bc-total-label')).map(l => l.textContent)

    it('draws one total per column with the vertical number format', () => {
      render(container, data, { showTotal: true, verticalAxis: { numberFormat: '$|,.1f|' } })
      expect(totals()).toEqual(['$25.0', '$45.0'])
    })

    it('draws no totals by default', () => {
      render(container, data)
      expect(totals()).toEqual([])
    })

    it('sums only the positive stack and skips all-negative columns', () => {
      render(container, { labels: ['Q1', 'Q2'], values: [], series: [{ name: 'A', values: [10, -4] }, { name: 'B', values: [-3, -2] }, { name: 'C', values: [5, -1] }] }, { showTotal: true })
      expect(totals()).toEqual(['15'])
    })

    it('draws no totals in percent mode', () => {
      render(container, data, { showTotal: true, stackMode: StackMode.Percent })
      expect(totals()).toEqual([])
    })

    it('drops the top segment outside label so it does not overlap the total', () => {
      render(container, data, { showTotal: true, valueLabels: true, valueLabelPosition: ValueLabelPosition.Outside })
      expect(container.querySelectorAll('.bc-value-label[data-series="Product B"]')).toHaveLength(0)
      expect(totals()).toEqual(['25', '45'])
    })
  })

  it('rounds value labels to two decimals without a number format', () => {
    render(container, { labels: ['Q1'], values: [], series: [{ name: 'A', values: [10.456] }, { name: 'B', values: [5] }] }, { valueLabels: true })
    expect(container.querySelector('.bc-value-label[data-series="A"]')?.textContent).toBe('10.46')
  })

  const labelFor = (series: string, index: number) =>
    container.querySelectorAll(`.bc-value-label[data-series="${series}"]`)[index] as SVGTextElement
  const barFor = (series: string, index: number) =>
    container.querySelectorAll(`.bc-bar-stacked[data-series="${series}"]`)[index] as SVGRectElement

  it('places value labels above each segment with valueLabelPosition outside', () => {
    render(container, data, { valueLabels: true, valueLabelPosition: ValueLabelPosition.Outside })
    const label = labelFor('Product B', 1)
    expect(label.getAttribute('dominant-baseline')).toBe('auto')
    expect(label.getAttribute('fill')).toBe('currentColor')
    expect(Number(label.getAttribute('y'))).toBeLessThan(Number(barFor('Product B', 1).getAttribute('y')))
  })

  it('skips zero-value segments with valueLabelPosition outside', () => {
    const withZero = { labels: ['Q1'], values: [], series: [
      { name: 'Product A', values: [10] },
      { name: 'Product B', values: [0] },
      { name: 'Product C', values: [10] },
    ] }
    render(container, withZero, { valueLabels: true, valueLabelPosition: ValueLabelPosition.Outside })
    expect(container.querySelectorAll('.bc-value-label[data-series="Product B"]')).toHaveLength(0)
  })

  it('keeps value labels centered in each segment with valueLabelPosition inside', () => {
    render(container, data, { valueLabels: true, valueLabelPosition: ValueLabelPosition.Inside })
    const baselines = Array.from(container.querySelectorAll('.bc-value-label')).map(l => l.getAttribute('dominant-baseline'))
    expect(baselines).toEqual(['central', 'central', 'central', 'central'])
  })

  it('moves a top segment label that does not fit inside above the column in auto mode', () => {
    const thinTop = { labels: ['Q1'], values: [], series: [
      { name: 'Product A', values: [1000] },
      { name: 'Product B', values: [1] },
    ] }
    render(container, thinTop, { valueLabels: true })
    const label = labelFor('Product B', 0)
    expect(label.getAttribute('dominant-baseline')).toBe('auto')
    expect(Number(label.getAttribute('y'))).toBeLessThan(Number(barFor('Product B', 0).getAttribute('y')))
    expect(labelFor('Product A', 0).getAttribute('dominant-baseline')).toBe('central')
  })

  const bottomOf = (bar: SVGRectElement) => Number(bar.getAttribute('y')) + Number(bar.getAttribute('height'))
  const diverging = { labels: ['Q1'], values: [], series: [
    { name: 'Product A', values: [10] },
    { name: 'Product B', values: [-10] },
    { name: 'Product C', values: [-10] },
  ] }

  it('places negative segment value labels below each segment with valueLabelPosition outside', () => {
    render(container, diverging, { valueLabels: true, valueLabelPosition: ValueLabelPosition.Outside })
    const label = labelFor('Product B', 0)
    expect(Number(label.getAttribute('y'))).toBeGreaterThan(bottomOf(barFor('Product B', 0)))
    expect(Number(labelFor('Product C', 0).getAttribute('y'))).toBeGreaterThan(bottomOf(barFor('Product C', 0)))
  })

  it('moves a bottom negative segment label that does not fit inside below the column in auto mode', () => {
    const thinBottom = { labels: ['Q1'], values: [], series: [
      { name: 'Product A', values: [1000] },
      { name: 'Product B', values: [-500] },
      { name: 'Product C', values: [-1] },
    ] }
    render(container, thinBottom, { valueLabels: true })
    const label = labelFor('Product C', 0)
    expect(label.getAttribute('dominant-baseline')).toBe('auto')
    expect(Number(label.getAttribute('y'))).toBeGreaterThan(bottomOf(barFor('Product C', 0)))
  })

  it('does not render value labels by default', () => {
    render(container, data)
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(0)
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
    const tickLabels = container.querySelectorAll('.bc-axis-horizontal .tick text')
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

  it('reuses a single clipPath across repeated renders to the same container', () => {
    for (let i = 0; i < 5; i++) {
      render(container, data)
    }
    expect(container.querySelectorAll('clipPath')).toHaveLength(1)
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
    // Only Product A bars: 2 labels x 1 series = 2
    expect(bars).toHaveLength(2)
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

  // ── X-axis label rotation ────────────────────────────────────────

  describe('x-axis label rotation', () => {
    let rectSpy: ReturnType<typeof vi.spyOn>

    function setContainerWidth(w: number) {
      rectSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
        width: w, height: 400, x: 0, y: 0, top: 0, left: 0, bottom: 400, right: w, toJSON: () => ({}),
      })
    }

    afterEach(() => {
      rectSpy?.mockRestore()
    })

    it('rotates x-axis labels when labels do not fit horizontally', () => {
      setContainerWidth(500)
      const manyLabels = {
        labels: Array.from({ length: 20 }, (_, i) => `Category ${i + 1}`),
        values: [],
        series: [
          { name: 'A', values: Array.from({ length: 20 }, () => 10) },
          { name: 'B', values: Array.from({ length: 20 }, () => 15) },
        ],
      }
      render(container, manyLabels)
      const hAxis = container.querySelector('.bc-axis-horizontal')!
      const texts = hAxis.querySelectorAll('.tick text')
      expect(texts.length).toBeGreaterThan(10)
      texts.forEach((t) => {
        expect(t.getAttribute('transform')).toBe('rotate(-90)')
      })
    })

    it('does not rotate labels when they fit horizontally', () => {
      setContainerWidth(500)
      render(container, data)
      const hAxis = container.querySelector('.bc-axis-horizontal')!
      hAxis.querySelectorAll('.tick text').forEach((t) => {
        expect(t.getAttribute('transform')).toBeNull()
      })
    })

    it('wraps multi-word labels across lines instead of rotating when wrap fits', () => {
      setContainerWidth(500)
      const multiWord = {
        labels: Array.from({ length: 6 }, (_, i) => `Column Label ${i + 1}`),
        values: [],
        series: [
          { name: 'A', values: Array.from({ length: 6 }, () => 10) },
          { name: 'B', values: Array.from({ length: 6 }, () => 15) },
        ],
      }
      render(container, multiWord)
      const hAxis = container.querySelector('.bc-axis-horizontal')!
      const texts = hAxis.querySelectorAll('.tick text')
      expect(texts.length).toBe(6)
      texts.forEach((t) => {
        expect(t.getAttribute('transform')).toBeNull()
        expect(t.querySelectorAll('tspan').length).toBeGreaterThanOrEqual(2)
      })
    })

    it('honours horizontalAxis.labelRotation="horizontal" override (thins instead)', () => {
      setContainerWidth(500)
      const manyLabels = {
        labels: Array.from({ length: 20 }, (_, i) => `Category ${i + 1}`),
        values: [],
        series: [
          { name: 'A', values: Array.from({ length: 20 }, () => 10) },
        ],
      }
      render(container, manyLabels, { horizontalAxis: { labelRotation: LabelRotation.Horizontal } })
      const hAxis = container.querySelector('.bc-axis-horizontal')!
      hAxis.querySelectorAll('.tick text').forEach((t) => {
        expect(t.getAttribute('transform')).toBeNull()
      })
    })
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

  // ── Colorize ─────────────────────────────────────────────────────

  it('applies colorize to the targeted series', () => {
    render(container, data, { colorizes: [{ target: 'Product A', color: '#ff0000' }] })
    const bars = Array.from(container.querySelectorAll('.bc-bar-stacked'))
    const a = bars.find(b => b.getAttribute('data-series') === 'Product A')
    const other = bars.find(b => b.getAttribute('data-series') === 'Product B')
    expect(a?.getAttribute('fill')).toBe('#ff0000')
    expect(other?.getAttribute('fill')).not.toBe('#ff0000')
  })

  // ── valueLabels percent ──────────────────────────────────────────

  it('renders value labels as share-of-column percentages with valueLabels="percent"', () => {
    const singleColumnData = {
      labels: ['Col'],
      values: [],
      series: [
        { name: 'A', values: [25] },
        { name: 'B', values: [75] },
      ],
    }
    render(container, singleColumnData, { valueLabels: 'percent' })
    const texts = Array.from(container.querySelectorAll('.bc-value-label')).map(el => el.textContent)
    expect(texts).toEqual(expect.arrayContaining(['25%', '75%']))
  })

  // ── barGap ───────────────────────────────────────────────────────

  describe('barGap', () => {
    // Stacked columns share the same x/width per label; one rect per stack is
    // enough to reason about column geometry.
    function columnExtents(): { xs: number[], widths: number[] } {
      const bars = Array.from(container.querySelectorAll('.bc-bar-stacked'))
      const byLabel = new Map<number, { x: number, w: number }>()
      for (const b of bars) {
        const x = Number(b.getAttribute('x'))
        byLabel.set(x, { x, w: Number(b.getAttribute('width')) })
      }
      const ordered = [...byLabel.values()].sort((a, b) => a.x - b.x)
      return { xs: ordered.map(o => o.x), widths: ordered.map(o => o.w) }
    }

    it('renders adjacent stacked columns flush when barGap=0', () => {
      render(container, data, { barGap: 0, legend: false })
      const { xs, widths } = columnExtents()
      expect(xs).toHaveLength(2)
      expect(xs[1] - (xs[0] + widths[0])).toBeCloseTo(0, 5)
    })

    it('produces a gap equal to 50% of column width when barGap=50', () => {
      render(container, data, { barGap: 50, legend: false })
      const { xs, widths } = columnExtents()
      const gap = xs[1] - (xs[0] + widths[0])
      expect(gap / widths[0]).toBeCloseTo(0.5, 5)
    })
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

    it('emits no negative rect height', () => {
      render(container, diverging, { stackMode: StackMode.Percent })
      const heights = Array.from(container.querySelectorAll('.bc-bar-stacked')).map(r => Number(r.getAttribute('height')))
      expect(heights).toHaveLength(4)
      expect(heights.every(h => h >= 0)).toBe(true)
    })

    it('keeps every segment inside the plot', () => {
      render(container, diverging, { stackMode: StackMode.Percent })
      const rects = Array.from(container.querySelectorAll('.bc-bar-stacked'))
      expect(rects.every(r => Number(r.getAttribute('y')) >= 0)).toBe(true)
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
  // #40: the inside value label used to be painted `currentColor` on every
  // segment, which reads as #555 in the browser: 1.2:1 on the default palette's
  // first colour. The label sits on its own segment, so the segment fill is the
  // background to measure against.
  describe('inside value label contrast', () => {
    const AA_RATIO = 4.5

    function labelRatios(host: HTMLElement): { fill: string, label: string, ratio: number }[] {
      return Array.from(host.querySelectorAll('.bc-value-label')).map((label) => {
        const seriesName = label.getAttribute('data-series')
        const segment = host.querySelector(`rect.bc-bar-stacked[data-series="${seriesName}"]`)!
        const fill = segment.getAttribute('fill') ?? ''
        return {
          fill,
          label: label.getAttribute('fill') ?? '',
          ratio: wcagContrastRatio(label.getAttribute('fill') ?? '', fill),
        }
      })
    }

    function renderIntoFreshHost(options: Record<string, unknown>): HTMLElement {
      const host = document.createElement('div')
      document.body.appendChild(host)
      render(host, data, options)
      return host
    }

    it(`clears ${AA_RATIO}:1 on the default palette`, () => {
      const host = renderIntoFreshHost({ valueLabels: true, colors: resolvePalette('Blueprint') ?? [] })
      const ratios = labelRatios(host)
      expect(ratios).toHaveLength(4)
      expect(ratios.filter(r => r.ratio < AA_RATIO)).toEqual([])
    })

    it(`clears ${AA_RATIO}:1 once autoContrast has darkened the fills`, () => {
      const colors = adjustColorsForBackground(resolvePalette('Blueprint') ?? [], '#ffffff')
      const ratios = labelRatios(renderIntoFreshHost({ valueLabels: true, colors }))
      expect(ratios).toHaveLength(4)
      expect(ratios.filter(r => r.ratio < AA_RATIO)).toEqual([])
    })

    // Across the whole shipped set, some mid-tones (#888b8d, #cb54d6, ...) top
    // out at 3.6-4.3:1 because the library picks between #fff and #333 only.
    // Reaching AA there means changing that choice for every chart type, so
    // what this asserts is that no segment gets the worse of the two.
    it('picks the more contrasting of the two label colours on every shipped palette', () => {
      const offenders: string[] = []
      for (const palette of listPalettes()) {
        const ratios = labelRatios(renderIntoFreshHost({ valueLabels: true, colors: palette.colors }))
        expect(ratios, palette.name).not.toHaveLength(0)
        for (const { fill, label, ratio } of ratios) {
          const best = Math.max(wcagContrastRatio('#fff', fill), wcagContrastRatio('#333', fill))
          if (ratio < best) {
            offenders.push(`${palette.name} ${label} on ${fill}: ${ratio.toFixed(2)}:1 where ${best.toFixed(2)}:1 was available`)
          }
        }
      }
      expect(offenders).toEqual([])
    })
  })

  describe('overlays', () => {
    const overlayData = {
      labels: ['A', 'B'],
      values: [],
      series: [
        { name: 'A', values: [5, 3] },
        { name: 'B', values: [2, 4] },
        { name: 'Target', values: [9, 6] },
      ],
    }
    const target = [{ columns: ['Target'] }]

    function markers(): Element[] {
      return Array.from(container.querySelectorAll('line.bc-overlay-value'))
    }

    function plotExtent(): number {
      const clip = container.querySelector('clipPath rect')!
      return Number(clip.getAttribute('height'))
    }

    it('draws one marker per category and keeps the target out of the stack', () => {
      render(container, overlayData, { overlays: target })
      expect(markers()).toHaveLength(2)
      expect(container.querySelector('.bc-bar[data-series="Target"]')).toBeNull()
    })

    it('spans the full stack thickness', () => {
      render(container, overlayData, { overlays: target })
      const marker = markers()[0]
      const bars = Array.from(container.querySelectorAll('.bc-bar-stacked')).filter(b => b.getAttribute('data-series') === 'A' || b.getAttribute('data-series') === 'B')
      const first = bars[0]
      const start = Number(marker.getAttribute('x1'))
      const end = Number(marker.getAttribute('x2'))
      const barStart = Number(first.getAttribute('x'))
      const barSize = Number(first.getAttribute('width'))
      expect(start).toBeCloseTo(barStart, 3)
      expect(end - start).toBeCloseTo(barSize, 3)
    })

    it('grows the value axis to include the overlay', () => {
      const tall = { ...overlayData, series: overlayData.series.map(s => s.name === 'Target' ? { ...s, values: [30, 30] } : s) }
      render(container, tall, { overlays: target })
      const position = Number(markers()[0].getAttribute('y1'))
      const inside = position >= -0.001 && position <= plotExtent()
      expect(inside).toBe(true)
    })

    it('drops overlays in percent mode and keeps the target out of the stack', () => {
      render(container, overlayData, { overlays: target, stackMode: StackMode.Percent })
      expect(container.querySelector('.bc-overlay')).toBeNull()
      expect(container.querySelector('.bc-bar[data-series="Target"]')).toBeNull()
    })

    it('extends the domain below zero for a negative overlay', () => {
      const negative = {
        labels: ['A', 'B'],
        values: [],
        series: [
          { name: 'A', values: [5, 3] },
          { name: 'B', values: [-2, 4] },
          { name: 'Lo', values: [-5, 0] },
          { name: 'Hi', values: [1, 6] },
        ],
      }
      render(container, negative, { overlays: [{ columns: ['Lo', 'Hi'] }] })
      const range = container.querySelector('rect.bc-overlay-range')!
      const lowEdge = Number(range.getAttribute('y'))
      const bottom = lowEdge + Number(range.getAttribute('height'))
      expect(bottom).toBeLessThanOrEqual(plotExtent() + 0.001)
    })
  })

  describe('overlay key', () => {
    function legendTexts(): (string | null)[] {
      return Array.from(container.querySelectorAll('.bc-legend-item')).map(node => node.textContent)
    }

    const keyData = {
      labels: ['A', 'B'],
      values: [],
      series: [
        { name: 'A', values: [5, 3] },
        { name: 'B', values: [2, 4] },
        { name: 'Target', values: [9, 6] },
      ],
    }
    const keyTarget = [{ columns: ['Target'] }]

    it('lists the target with a line swatch', () => {
      render(container, keyData, { overlays: keyTarget })
      expect(legendTexts()).toEqual(['A', 'B', 'Target'])
      const swatch = container.querySelectorAll('.bc-legend-item rect')[2]
      expect(swatch.getAttribute('height')).toBe('3')
    })

    it('hides the key with legend false', () => {
      render(container, keyData, { overlays: keyTarget, legend: false })
      expect(container.querySelectorAll('.bc-legend-item')).toHaveLength(0)
    })
  })

  describe('overlay cues', () => {
    const cueData = {
      labels: ['A', 'B', 'C'],
      values: [],
      series: [
        { name: 'X', values: [5, 4, 6] },
        { name: 'Y', values: [-2, 4, -2] },
        { name: 'T', values: [3, 9, 5] },
      ],
    }
    const colors = [{ columns: ['T'], aboveColor: '#00ff00', belowColor: '#ff0000' }]
    const mute = [{ columns: ['Lo', 'Hi'], muteIfCrosses: 7 }]
    const muteData = {
      ...cueData,
      series: [...cueData.series, { name: 'Lo', values: [2, 6, 0] }, { name: 'Hi', values: [4, 8, 1] }],
    }

    function rowBars(row: number): Element[] {
      const names = ['X', 'Y']
      return names.map(name => container.querySelectorAll(`.bc-bar[data-series="${name}"]`)[row])
    }

    function rowFills(row: number): (string | null)[] {
      return rowBars(row).map(bar => bar.getAttribute('fill'))
    }

    it('colors every segment of a row by the net total', () => {
      render(container, cueData, { overlays: colors })
      expect(rowFills(0)).toEqual(['#00ff00', '#00ff00'])
      expect(rowFills(1)).toEqual(['#ff0000', '#ff0000'])
    })

    it('compares the net total, not the positive sum', () => {
      render(container, cueData, { overlays: colors })
      expect(rowFills(2)).toEqual(['#ff0000', '#ff0000'])
    })

    it('fades every segment of the crossing row', () => {
      render(container, muteData, { overlays: mute })
      rowBars(1).forEach(bar => expect(bar.getAttribute('opacity')).toBe('0.45'))
      rowBars(0).forEach(bar => expect(bar.getAttribute('opacity')).toBeNull())
    })

    it('uses currentColor for an inside label on a faded segment', () => {
      render(container, muteData, { overlays: mute, valueLabels: true, valueLabelPosition: ValueLabelPosition.Inside })
      const labels = container.querySelectorAll('.bc-value-label[data-series="X"]')
      expect(labels[1].getAttribute('fill')).toBe('currentColor')
    })

    it('brings the row back to full opacity when a scene drops the cue', () => {
      render(container, muteData, { overlays: mute })
      render(container, muteData, { overlays: [{ columns: ['Lo', 'Hi'] }] }, true)
      rowBars(1).forEach(bar => expect(bar.getAttribute('opacity')).toBeNull())
    })

    it('applies no cue on a percent stack', () => {
      render(container, cueData, { overlays: colors, stackMode: StackMode.Percent })
      rowBars(0).forEach(bar => expect(bar.getAttribute('fill')).not.toBe('#00ff00'))
      rowBars(1).forEach(bar => expect(bar.getAttribute('fill')).not.toBe('#ff0000'))
    })

    it('lets colorize win over the target color', () => {
      render(container, cueData, { overlays: colors, colorizes: [{ target: 'X', color: '#0000ff' }] })
      expect(rowFills(0)).toEqual(['#0000ff', '#00ff00'])
    })
  })

  describe('whisker value labels', () => {
    const whiskerData = {
      labels: ['A'],
      values: [],
      series: [
        { name: 'First', values: [50] },
        { name: 'Second', values: [30] },
        { name: 'Low', values: [60] },
        { name: 'High', values: [95] },
      ],
    }
    const overlays = [{ columns: ['Low', 'High'], pattern: 'whisker' as const }]
    const axis = { verticalAxis: { range: { min: 0, max: 100 } } }

    function stemTop(): number {
      const d = container.querySelector('.bc-overlay-whisker')!.getAttribute('d')!
      return d.match(/-?[\d.]+/g)!.map(Number)[1]
    }

    function labelY(series: string): number {
      return Number(container.querySelector(`.bc-value-label[data-series="${series}"]`)!.getAttribute('y'))
    }

    it('places the total past the whisker cap', () => {
      render(container, whiskerData, { showTotal: true, overlays, ...axis })
      const total = container.querySelector('.bc-total-label')!
      expect(Number(total.getAttribute('y'))).toBeCloseTo(stemTop() - 1 - 4)
    })

    it('places the last outside segment label past the whisker cap', () => {
      render(container, whiskerData, { valueLabels: true, valueLabelPosition: ValueLabelPosition.Outside, overlays, ...axis })
      expect(labelY('Second')).toBeCloseTo(stemTop() - 1 - 4)
    })

    it('keeps an inner segment label where it was', () => {
      render(container, whiskerData, { valueLabels: true, valueLabelPosition: ValueLabelPosition.Outside, ...axis })
      const before = labelY('First')
      render(container, whiskerData, { valueLabels: true, valueLabelPosition: ValueLabelPosition.Outside, overlays, ...axis })
      expect(labelY('First')).toBeCloseTo(before)
    })

    it('keeps the total on the plot when the axis range cuts the whisker', () => {
      render(container, whiskerData, { showTotal: true, overlays, verticalAxis: { range: { min: 0, max: 85 } } })
      const total = container.querySelector('.bc-total-label')!
      expect(Number(total.getAttribute('y'))).toBeGreaterThanOrEqual(-4)
    })
  })
})
