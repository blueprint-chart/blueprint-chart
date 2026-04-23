import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './bar-multi'
import { ValueLabelPosition, DirectLabelMode, LabelRotation } from '../../../enums'

describe('bar-multi', () => {
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

  it('renders grouped bars', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-multi')
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
    const bars = container.querySelectorAll('.bc-bar-multi')
    const seriesIndices = Array.from(bars).map(b => b.getAttribute('data-series'))
    // Each label group has series index 0 and 1
    expect(seriesIndices).toContain('0')
    expect(seriesIndices).toContain('1')
  })

  it('renders bars as rect elements with bc-bar class', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-multi')
    for (const bar of bars) {
      expect(bar.tagName.toLowerCase()).toBe('rect')
      expect(bar.classList.contains('bc-bar')).toBe(true)
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

  // ── Legend position ──────────────────────────────────────────────

  it('renders legend at top by default', () => {
    render(container, data)
    const legend = container.querySelector('.bc-legend')
    expect(legend).not.toBeNull()
    // Default position is top; legend should have a negative y translation
    const transform = legend!.getAttribute('transform')
    expect(transform).toBeTruthy()
  })

  it('renders legend at bottom position', () => {
    render(container, data, { legendPosition: 'bottom' })
    const legend = container.querySelector('.bc-legend')
    expect(legend).not.toBeNull()
    // Legend should exist with a transform placing it below the chart area
    const transform = legend!.getAttribute('transform')
    expect(transform).toBeTruthy()
    // Bottom legend y translate should be positive (below chart)
    const yMatch = transform!.match(/translate\(\s*[\d.]+\s*,\s*([\d.]+)\s*\)/)
    if (yMatch) {
      expect(parseFloat(yMatch[1])).toBeGreaterThan(0)
    }
  })

  it('renders legend at left position', () => {
    render(container, data, { legendPosition: 'left' })
    const legend = container.querySelector('.bc-legend')
    expect(legend).not.toBeNull()
  })

  it('renders legend at right position', () => {
    render(container, data, { legendPosition: 'right' })
    const legend = container.querySelector('.bc-legend')
    expect(legend).not.toBeNull()
  })

  // ── Value labels ─────────────────────────────────────────────────

  it('renders value labels when valueLabels is true', () => {
    render(container, data, { valueLabels: true })
    const labels = container.querySelectorAll('.bc-value-label')
    // One label per bar = 4
    expect(labels).toHaveLength(4)
  })

  it('does not render value labels by default', () => {
    render(container, data)
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(0)
  })

  it('value labels display correct text', () => {
    render(container, data, { valueLabels: true })
    const labels = container.querySelectorAll('.bc-value-label')
    const texts = Array.from(labels).map(l => l.textContent)
    // Should contain all four values
    expect(texts).toContain('10')
    expect(texts).toContain('20')
    expect(texts).toContain('15')
    expect(texts).toContain('25')
  })

  // ── Colors ───────────────────────────────────────────────────────

  it('applies custom colors to bars', () => {
    render(container, data, { colors: ['#ff0000', '#00ff00'] })
    const bars = container.querySelectorAll('.bc-bar-multi')
    // Series 0 bars should be red, series 1 bars should be green
    const series0Fills = Array.from(bars)
      .filter(b => b.getAttribute('data-series') === '0')
      .map(b => b.getAttribute('fill'))
    const series1Fills = Array.from(bars)
      .filter(b => b.getAttribute('data-series') === '1')
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
    const bars = container.querySelectorAll('.bc-bar-multi')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    // All bars should have a fill
    for (const fill of fills) {
      expect(fill).toBeTruthy()
    }
    // Default first color is #4e79a7
    const series0Fills = Array.from(bars)
      .filter(b => b.getAttribute('data-series') === '0')
      .map(b => b.getAttribute('fill'))
    for (const fill of series0Fills) {
      expect(fill).toBe('#4e79a7')
    }
  })

  // ── Frame title ──────────────────────────────────────────────────

  it('renders frame title when frame.title is set', () => {
    render(container, data, { frame: { title: 'Sales by Quarter' } })
    const title = container.querySelector('.bc-frame-title')
    expect(title).not.toBeNull()
    expect(title!.textContent).toBe('Sales by Quarter')
  })

  it('does not render frame title by default', () => {
    render(container, data)
    const title = container.querySelector('.bc-frame-title')
    expect(title).toBeNull()
  })

  // ── Crosshair ────────────────────────────────────────────────────

  it('adds crosshair lines when crosshair is true', () => {
    render(container, data, { crosshair: true })
    const vLine = container.querySelector('.bc-crosshair-v')
    const hLine = container.querySelector('.bc-crosshair-h')
    expect(vLine).not.toBeNull()
    expect(hLine).not.toBeNull()
  })

  it('does not add crosshair lines by default', () => {
    render(container, data)
    const vLine = container.querySelector('.bc-crosshair-v')
    expect(vLine).toBeNull()
  })

  it('crosshair lines are initially hidden', () => {
    render(container, data, { crosshair: true })
    const vLine = container.querySelector('.bc-crosshair-v') as SVGLineElement
    expect(vLine.style.display).toBe('none')
  })

  // ── Tooltips ─────────────────────────────────────────────────────

  it('creates tooltip element when tooltips is true', () => {
    render(container, data, { tooltips: true })
    const tooltip = document.querySelector('.bc-tooltip')
    expect(tooltip).not.toBeNull()
    // Clean up tooltip from body
    tooltip?.remove()
  })

  it('does not create tooltip element by default', () => {
    // Remove any prior tooltip elements
    document.querySelectorAll('.bc-tooltip').forEach(el => el.remove())
    render(container, data)
    const tooltip = document.querySelector('.bc-tooltip')
    expect(tooltip).toBeNull()
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
    const bars = container.querySelectorAll('.bc-bar-multi')
    expect(bars.length).toBeGreaterThanOrEqual(6)
  })

  it('replaces container content on transition render', () => {
    render(container, data)
    render(container, data, {}, true)
    // Should still have exactly one frame; two SVGs (chart + credit logo)
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
    // Check horizontal axis tick labels order
    const tickLabels = container.querySelectorAll('.bc-axis-horizontal .tick text')
    const labelTexts = Array.from(tickLabels).map(t => t.textContent)
    // 'High' total=300 should come first, 'Mid' total=150, 'Low' total=3
    expect(labelTexts[0]).toBe('High')
    expect(labelTexts[1]).toBe('Mid')
    expect(labelTexts[2]).toBe('Low')
  })

  it('preserves label order when sortMode is not set', () => {
    const orderedData = {
      labels: ['Alpha', 'Beta', 'Gamma'],
      values: [],
      series: [
        { name: 'A', values: [100, 1, 50] },
      ],
    }
    render(container, orderedData)
    const tickLabels = container.querySelectorAll('.bc-axis-horizontal .tick text')
    const labelTexts = Array.from(tickLabels).map(t => t.textContent)
    expect(labelTexts[0]).toBe('Alpha')
    expect(labelTexts[1]).toBe('Beta')
    expect(labelTexts[2]).toBe('Gamma')
  })

  // ── Direct labelling ─────────────────────────────────────────────

  it('renders direct labels when directLabelling is auto', () => {
    render(container, data, { directLabelling: DirectLabelMode.Auto })
    const directLabels = container.querySelectorAll('.bc-direct-label')
    // One direct label per bar = 4 (2 labels x 2 series)
    expect(directLabels).toHaveLength(4)
  })

  it('hides legend when directLabelling is enabled', () => {
    render(container, data, { directLabelling: DirectLabelMode.Auto })
    const legend = container.querySelector('.bc-legend')
    expect(legend).toBeNull()
  })

  it('direct labels contain series names', () => {
    render(container, data, { directLabelling: DirectLabelMode.Auto })
    const directLabels = container.querySelectorAll('.bc-direct-label')
    const texts = Array.from(directLabels).map(l => l.textContent)
    expect(texts).toContain('Product A')
    expect(texts).toContain('Product B')
  })

  it('direct labels default to outside in auto mode', () => {
    render(container, data, { directLabelling: DirectLabelMode.Auto })
    const directLabels = container.querySelectorAll('.bc-direct-label')
    // Outside labels should NOT use 'central' baseline
    const baselines = Array.from(directLabels).map(l => l.getAttribute('dominant-baseline'))
    expect(baselines.every(b => b !== 'central')).toBe(true)
  })

  it('direct labels match value label position when both are enabled', () => {
    render(container, data, { directLabelling: DirectLabelMode.Auto, valueLabels: true, valueLabelPosition: ValueLabelPosition.Inside })
    const directLabels = container.querySelectorAll('.bc-direct-label')
    // When value labels are inside, direct labels should also be inside (central baseline)
    const baselines = Array.from(directLabels).map(l => l.getAttribute('dominant-baseline'))
    expect(baselines.some(b => b === 'central')).toBe(true)
  })

  // ── Axis options ─────────────────────────────────────────────────

  it('renders vertical axis by default', () => {
    render(container, data)
    const vAxis = container.querySelector('.bc-axis-vertical')
    expect(vAxis).not.toBeNull()
  })

  it('renders horizontal axis by default', () => {
    render(container, data)
    const hAxis = container.querySelector('.bc-axis-horizontal')
    expect(hAxis).not.toBeNull()
  })

  it('removes vertical axis domain line when showAxis is false', () => {
    render(container, data, { verticalAxis: { showAxis: false } })
    const vAxis = container.querySelector('.bc-axis-vertical')
    expect(vAxis).not.toBeNull()
    const domain = vAxis!.querySelector('.domain')
    expect(domain).toBeNull()
  })

  it('hides horizontal axis line when showAxis is false', () => {
    render(container, data, { horizontalAxis: { showAxis: false } })
    const hAxis = container.querySelector('.bc-axis-horizontal')
    expect(hAxis).not.toBeNull()
    const domain = hAxis!.querySelector('.domain')
    if (domain) {
      const display = domain.getAttribute('style') || ''
      const opacity = domain.getAttribute('opacity')
      const hasHiddenIndicator = display.includes('display: none') || opacity === '0' || domain.getAttribute('display') === 'none'
      expect(hasHiddenIndicator).toBe(true)
    }
  })

  // ── Zero baseline ────────────────────────────────────────────────

  it('renders zero baseline when data spans zero', () => {
    const negData = {
      labels: ['A', 'B'],
      values: [],
      series: [
        { name: 'S1', values: [-10, 20] },
      ],
    }
    render(container, negData)
    const baseline = container.querySelector('.bc-zero-baseline')
    expect(baseline).not.toBeNull()
  })

  it('does not render zero baseline when all values are positive', () => {
    render(container, data)
    const baseline = container.querySelector('.bc-zero-baseline')
    expect(baseline).toBeNull()
  })

  // ── Series overrides ─────────────────────────────────────────────

  it('applies series color override', () => {
    render(container, data, {
      seriesOverrides: [{ name: 'Product A', color: '#abcdef' }],
    })
    const bars = container.querySelectorAll('.bc-bar-multi')
    const series0Bars = Array.from(bars).filter(b => b.getAttribute('data-series') === '0')
    for (const bar of series0Bars) {
      expect(bar.getAttribute('fill')).toBe('#abcdef')
    }
  })

  it('hides series when hidden override is set', () => {
    render(container, data, {
      seriesOverrides: [{ name: 'Product B', hidden: true }],
    })
    const bars = container.querySelectorAll('.bc-bar-multi')
    // Only Product A bars: 2 labels x 1 series = 2
    expect(bars).toHaveLength(2)
  })

  it('applies opacity override to series', () => {
    render(container, data, {
      seriesOverrides: [{ name: 'Product A', opacity: 0.5 }],
    })
    const bars = container.querySelectorAll('.bc-bar-multi')
    const series0Bars = Array.from(bars).filter(b => b.getAttribute('data-series') === '0')
    for (const bar of series0Bars) {
      expect(bar.getAttribute('fill-opacity')).toBe('0.5')
    }
  })

  // ── Three or more series ─────────────────────────────────────────

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
    const bars = container.querySelectorAll('.bc-bar-multi')
    expect(bars).toHaveLength(6) // 2 labels x 3 series
    const items = container.querySelectorAll('.bc-legend-item')
    expect(items).toHaveLength(3)
  })

  // ── Single label ─────────────────────────────────────────────────

  it('renders correctly with a single label', () => {
    const singleLabel = {
      labels: ['Only'],
      values: [],
      series: [
        { name: 'A', values: [42] },
        { name: 'B', values: [17] },
      ],
    }
    render(container, singleLabel)
    const bars = container.querySelectorAll('.bc-bar-multi')
    expect(bars).toHaveLength(2)
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

  // ── barGap ───────────────────────────────────────────────────────

  describe('barGap', () => {
    // With 2 labels × 2 series, sorting bars by x cleanly partitions them into
    // [Q1 group, Q2 group]; each group of 2 sits next to each other.
    function groupExtents(groupIndex: 0 | 1): { left: number, right: number, bars: { x: number, w: number }[] } {
      const all = Array.from(container.querySelectorAll('.bc-bar-multi'))
        .map(b => ({ x: Number(b.getAttribute('x')), w: Number(b.getAttribute('width')) }))
        .sort((a, b) => a.x - b.x)
      const perGroup = all.length / 2
      const slice = all.slice(groupIndex * perGroup, (groupIndex + 1) * perGroup)
      return {
        left: slice[0].x,
        right: slice[slice.length - 1].x + slice[slice.length - 1].w,
        bars: slice,
      }
    }

    it('inter-category gap responds to barGap', () => {
      render(container, data, { barGap: 0, legend: false })
      const tightGroupW = groupExtents(0).right - groupExtents(0).left
      const tightGap = groupExtents(1).left - groupExtents(0).right

      container.replaceChildren()
      render(container, data, { barGap: 100, legend: false })
      const wideGroupW = groupExtents(0).right - groupExtents(0).left
      const wideGap = groupExtents(1).left - groupExtents(0).right

      // Wider barGap means narrower groups and larger gaps between categories.
      expect(wideGroupW).toBeLessThan(tightGroupW)
      expect(wideGap).toBeGreaterThan(tightGap)
      // At barGap=0 the outer paddingInner is 0; any residual gap between
      // groups is purely from the x1 scale's own 0.05 padding (≪ group width).
      expect(tightGap / tightGroupW).toBeLessThan(0.1)
      // At barGap=100 the outer gap matches one group's width (± the small
      // contribution from x1's 0.05 inner padding, ~5% of a group).
      expect(wideGap / wideGroupW).toBeGreaterThan(0.9)
      expect(wideGap / wideGroupW).toBeLessThan(1.15)
    })

    it('intra-group spacing keeps its default regardless of barGap', () => {
      function intraGroupRatio(): number {
        const inner = groupExtents(0).bars.sort((a, b) => a.x - b.x)
        const innerGap = inner[1].x - (inner[0].x + inner[0].w)
        return innerGap / inner[0].w
      }

      render(container, data, { barGap: 0, legend: false })
      const ratioTight = intraGroupRatio()

      container.replaceChildren()
      render(container, data, { barGap: 100, legend: false })
      const ratioWide = intraGroupRatio()

      // Default inner .padding(0.05) on x1 → gap/bandwidth = 0.05 / 0.95
      const expected = 0.05 / 0.95
      expect(ratioTight).toBeCloseTo(expected, 5)
      expect(ratioWide).toBeCloseTo(expected, 5)
    })
  })
})
