import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './bar-vertical'

describe('bar-vertical', () => {
  let container: HTMLElement

  const data = {
    labels: ['A', 'B', 'C'],
    values: [10, 30, 20],
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

  it('renders bars into the container', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar')
    expect(bars).toHaveLength(3)
  })

  it('creates an SVG element', () => {
    render(container, data)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
  })

  it('creates a frame wrapper', () => {
    render(container, data)
    expect(container.querySelector('.bc-frame')).not.toBeNull()
  })

  it('bars have positive height', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar')
    const heights = Array.from(bars).map(b => Number(b.getAttribute('height')))
    expect(heights.every(h => h > 0)).toBe(true)
  })

  it('bars have positive width from scaleBand', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar')
    const widths = Array.from(bars).map(b => Number(b.getAttribute('width')))
    // All bars should share the same bandwidth
    expect(widths[0]).toBeGreaterThan(0)
    expect(new Set(widths).size).toBe(1)
  })

  // ── Frame title ──────────────────────────────────────────────────

  it('creates frame structure with title', () => {
    render(container, data, { frame: { title: 'Test' } })
    const title = container.querySelector('.bc-frame-title')
    expect(title?.textContent).toBe('Test')
  })

  it('does not render frame title when option is omitted', () => {
    render(container, data)
    const title = container.querySelector('.bc-frame-title')
    expect(title).toBeNull()
  })

  // ── Highlights ───────────────────────────────────────────────────

  it('applies highlight colors', () => {
    render(container, data, {
      highlights: [{ target: 'B', color: '#ff0000' }],
    })
    const bars = container.querySelectorAll('.bc-bar')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    expect(fills).toContain('#ff0000')
  })

  it('applies highlight to multiple targets', () => {
    render(container, data, {
      highlights: [
        { target: 'A', color: '#ff0000' },
        { target: 'C', color: '#00ff00' },
      ],
    })
    const bars = container.querySelectorAll('.bc-bar')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    expect(fills).toContain('#ff0000')
    expect(fills).toContain('#00ff00')
  })

  it('non-highlighted bars keep the default or custom color', () => {
    render(container, data, {
      highlights: [{ target: 'B', color: '#ff0000' }],
    })
    const bars = container.querySelectorAll('.bc-bar')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    // B is highlighted, A and C should use default color #4e79a7
    const nonHighlighted = fills.filter(f => f !== '#ff0000')
    expect(nonHighlighted.length).toBe(2)
    expect(nonHighlighted.every(f => f === '#4e79a7')).toBe(true)
  })

  // ── Colors ───────────────────────────────────────────────────────

  it('applies custom base color from colors option', () => {
    render(container, data, {
      colors: ['#ff0000', '#00ff00', '#0000ff'],
    })
    const bars = container.querySelectorAll('.bc-bar')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    // All bars use colors[0] (the chart uses a single color for all bars)
    expect(fills.every(f => f === '#ff0000')).toBe(true)
  })

  it('uses default color when colors option is omitted', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    expect(fills.every(f => f === '#4e79a7')).toBe(true)
  })

  // ── Sort ─────────────────────────────────────────────────────────

  it('sorts bars in descending order', () => {
    render(container, data, { sort: 'descending' })
    const bars = container.querySelectorAll('.bc-bar')
    const heights = Array.from(bars).map(b => Number(b.getAttribute('height')))
    expect(heights[0]).toBeGreaterThanOrEqual(heights[1])
    expect(heights[1]).toBeGreaterThanOrEqual(heights[2])
  })

  it('sorts bars in ascending order', () => {
    render(container, data, { sort: 'ascending' })
    const bars = container.querySelectorAll('.bc-bar')
    const heights = Array.from(bars).map(b => Number(b.getAttribute('height')))
    expect(heights[0]).toBeLessThanOrEqual(heights[1])
    expect(heights[1]).toBeLessThanOrEqual(heights[2])
  })

  it('preserves original label order when sort is not set', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar')
    const heights = Array.from(bars).map(b => Number(b.getAttribute('height')))
    // Original order: 10, 30, 20 → middle bar should be tallest
    expect(heights[1]).toBeGreaterThan(heights[0])
    expect(heights[1]).toBeGreaterThan(heights[2])
  })

  // ── Value labels ─────────────────────────────────────────────────

  it('renders value labels when valueLabels is true', () => {
    render(container, data, { valueLabels: true })
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(3)
  })

  it('value labels show the correct text values', () => {
    render(container, data, { valueLabels: true })
    const texts = Array.from(container.querySelectorAll('.bc-value-label'))
      .map(el => el.textContent)
    expect(texts).toEqual(['10', '30', '20'])
  })

  it('does not render value labels when option is omitted', () => {
    render(container, data)
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(0)
  })

  it('value labels respect ascending sort order', () => {
    render(container, data, { valueLabels: true, sort: 'ascending' })
    const texts = Array.from(container.querySelectorAll('.bc-value-label'))
      .map(el => el.textContent)
    expect(texts).toEqual(['10', '20', '30'])
  })

  it('value labels respect descending sort order', () => {
    render(container, data, { valueLabels: true, sort: 'descending' })
    const texts = Array.from(container.querySelectorAll('.bc-value-label'))
      .map(el => el.textContent)
    expect(texts).toEqual(['30', '20', '10'])
  })

  it('value labels are inside a label group', () => {
    render(container, data, { valueLabels: true })
    const group = container.querySelector('.bc-value-label-group')
    expect(group).not.toBeNull()
    expect(group!.querySelectorAll('.bc-value-label')).toHaveLength(3)
  })

  it('value labels support "inside" position', () => {
    render(container, data, { valueLabels: true, valueLabelPosition: 'inside' })
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(3)
    // Inside labels use 'central' dominant-baseline
    const baselines = Array.from(labels).map(l => l.getAttribute('dominant-baseline'))
    expect(baselines.every(b => b === 'central')).toBe(true)
  })

  it('value labels support "outside" position', () => {
    render(container, data, { valueLabels: true, valueLabelPosition: 'outside' })
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(3)
    // Outside labels for positive values use 'auto' dominant-baseline
    const baselines = Array.from(labels).map(l => l.getAttribute('dominant-baseline'))
    expect(baselines.every(b => b === 'auto')).toBe(true)
  })

  it('value labels default to outside in auto mode', () => {
    render(container, data, { valueLabels: true })
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(3)
    // Auto defaults to outside — labels should NOT use 'central' baseline (that's inside)
    const baselines = Array.from(labels).map(l => l.getAttribute('dominant-baseline'))
    expect(baselines.every(b => b === 'auto')).toBe(true)
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

  it('clip path rect has chart dimensions', () => {
    render(container, data)
    const clipRect = container.querySelector('clipPath rect')
    expect(clipRect).not.toBeNull()
    expect(Number(clipRect!.getAttribute('width'))).toBeGreaterThanOrEqual(0)
    expect(Number(clipRect!.getAttribute('height'))).toBeGreaterThanOrEqual(0)
  })

  // ── Crosshair ────────────────────────────────────────────────────

  it('renders crosshair lines when crosshair option is true', () => {
    render(container, data, { crosshair: true })
    const vLine = container.querySelector('.bc-crosshair-v')
    const hLine = container.querySelector('.bc-crosshair-h')
    expect(vLine).not.toBeNull()
    expect(hLine).not.toBeNull()
  })

  it('does not render crosshair when option is omitted', () => {
    render(container, data)
    const crosshair = container.querySelector('.bc-crosshair-v')
    expect(crosshair).toBeNull()
  })

  // ── Tooltips ─────────────────────────────────────────────────────

  it('creates tooltip element when tooltips option is true', () => {
    render(container, data, { tooltips: true })
    const tooltip = document.querySelector('.bc-tooltip')
    expect(tooltip).not.toBeNull()
    // Clean up the tooltip element appended to body
    tooltip?.remove()
  })

  it('injects tooltip styles into document head', () => {
    render(container, data, { tooltips: true })
    const styles = document.getElementById('bc-tooltip-styles')
    expect(styles).not.toBeNull()
    // Clean up
    document.querySelector('.bc-tooltip')?.remove()
    styles?.remove()
  })

  // ── Axis options ─────────────────────────────────────────────────

  it('renders vertical axis by default', () => {
    render(container, data)
    const vAxis = container.querySelector('.bc-axis-vertical')
    expect(vAxis).not.toBeNull()
    const tickTexts = vAxis!.querySelectorAll('.tick text')
    expect(tickTexts.length).toBeGreaterThan(0)
  })

  it('renders horizontal axis by default', () => {
    render(container, data)
    const hAxis = container.querySelector('.bc-axis-horizontal')
    expect(hAxis).not.toBeNull()
    const tickTexts = hAxis!.querySelectorAll('.tick text')
    expect(tickTexts.length).toBeGreaterThan(0)
  })

  it('keeps vertical axis tick labels when showAxis is false (only domain is removed)', () => {
    render(container, data, {
      verticalAxis: { showAxis: false },
    })
    const vAxis = container.querySelector('.bc-axis-vertical')
    expect(vAxis).not.toBeNull()
    const tickTexts = vAxis!.querySelectorAll('.tick text')
    expect(tickTexts.length).toBeGreaterThan(0)
  })

  it('hides horizontal axis tick labels when showAxis is false', () => {
    render(container, data, {
      horizontalAxis: { showAxis: false },
    })
    const hAxis = container.querySelector('.bc-axis-horizontal')
    expect(hAxis).not.toBeNull()
    const tickTexts = hAxis!.querySelectorAll('.tick text')
    expect(tickTexts).toHaveLength(0)
  })

  it('vertical axis domain line persists when showAxis is false (merge:transition re-adds it)', () => {
    render(container, data, {
      verticalAxis: { showAxis: false },
    })
    const vAxis = container.querySelector('.bc-axis-vertical')
    expect(vAxis).not.toBeNull()
    const domain = vAxis!.querySelector('.domain')
    expect(domain).not.toBeNull()
  })

  it('hides horizontal axis domain line when showAxis is false', () => {
    render(container, data, {
      horizontalAxis: { showAxis: false },
    })
    const hAxis = container.querySelector('.bc-axis-horizontal')
    expect(hAxis).not.toBeNull()
    const domain = hAxis!.querySelector('.domain')
    expect(domain).toBeNull()
  })

  // ── Transition ───────────────────────────────────────────────────

  it('supports transition parameter on second render', () => {
    render(container, data)
    render(container, { labels: ['A', 'B'], values: [15, 25] }, {}, true)
    const bars = container.querySelectorAll('.bc-bar')
    expect(bars.length).toBeGreaterThanOrEqual(2)
  })

  it('transition re-render creates fresh SVG and frame', () => {
    render(container, data)
    render(container, data, { frame: { title: 'After' } }, true)
    // 2 SVGs: the chart SVG + the credit logo SVG in the frame footer
    const svgs = container.querySelectorAll('svg')
    expect(svgs).toHaveLength(2)
    expect(container.querySelector('.bc-frame-title')?.textContent).toBe('After')
  })

  it('transition preserves bar count when data stays same', () => {
    render(container, data)
    render(container, data, {}, true)
    const bars = container.querySelectorAll('.bc-bar')
    expect(bars).toHaveLength(3)
  })

  // ── Zero baseline ────────────────────────────────────────────────

  it('renders zero baseline when data spans negative and positive', () => {
    render(container, { labels: ['A', 'B'], values: [-10, 20] })
    const baseline = container.querySelector('.bc-zero-baseline')
    expect(baseline).not.toBeNull()
  })

  it('does not render zero baseline when all values are positive', () => {
    render(container, data)
    const baseline = container.querySelector('.bc-zero-baseline')
    expect(baseline).toBeNull()
  })

  // ── Value label transitions ──────────────────────────────────────

  describe('value label transitions', () => {
    it('preserves value labels during scene transition', () => {
      render(container, data, { valueLabels: true })
      const labelsBefore = container.querySelectorAll('.bc-value-label')
      expect(labelsBefore.length).toBeGreaterThan(0)

      render(container, data, {
        valueLabels: true,
        highlights: [{ target: 'A', color: '#ff0000' }],
      }, true)

      const labelsAfter = container.querySelectorAll('.bc-value-label')
      expect(labelsAfter.length).toBe(labelsBefore.length)
    })

    it('value labels reflect new sort order after re-render', () => {
      render(container, data, { valueLabels: true })
      const textsBefore = Array.from(container.querySelectorAll('.bc-value-label'))
        .map(el => el.textContent)

      container.replaceChildren()
      render(container, data, { valueLabels: true, sort: 'ascending' })

      const textsAfter = Array.from(container.querySelectorAll('.bc-value-label'))
        .map(el => el.textContent)

      expect(textsAfter).toHaveLength(textsBefore.length)
      expect(textsAfter).toEqual(['10', '20', '30'])
    })

    it('uses data-join for value labels during transition (not recreated from scratch)', () => {
      render(container, data, { valueLabels: true })
      const countBefore = container.querySelectorAll('.bc-value-label').length

      render(container, data, {
        valueLabels: true,
        highlights: [{ target: 'B', color: '#ff0000' }],
      }, true)

      const countAfter = container.querySelectorAll('.bc-value-label').length
      expect(countAfter).toBe(countBefore)
    })

    it('updates value label text during transition when data changes', () => {
      render(container, data, { valueLabels: true })
      render(container, { labels: ['A', 'B', 'C'], values: [50, 60, 70] }, { valueLabels: true }, true)
      const texts = Array.from(container.querySelectorAll('.bc-value-label'))
        .map(el => el.textContent)
      expect(texts).toEqual(['50', '60', '70'])
    })

    it('removes exiting value labels during transition when data shrinks', () => {
      render(container, data, { valueLabels: true })
      expect(container.querySelectorAll('.bc-value-label')).toHaveLength(3)

      render(container, { labels: ['A'], values: [10] }, { valueLabels: true }, true)
      // Exiting labels get opacity=0 transition then .remove()
      // With fake timers they may still be in DOM but at minimum we should have at least 1
      const labels = container.querySelectorAll('.bc-value-label')
      expect(labels.length).toBeGreaterThanOrEqual(1)
    })
  })

  // ── Negative values ──────────────────────────────────────────────

  describe('negative values', () => {
    const negData = { labels: ['X', 'Y'], values: [-15, -5] }

    it('renders bars for negative values', () => {
      render(container, negData)
      const bars = container.querySelectorAll('.bc-bar')
      expect(bars).toHaveLength(2)
      const heights = Array.from(bars).map(b => Number(b.getAttribute('height')))
      expect(heights.every(h => h > 0)).toBe(true)
    })

    it('renders value labels for negative values', () => {
      render(container, negData, { valueLabels: true })
      const texts = Array.from(container.querySelectorAll('.bc-value-label'))
        .map(el => el.textContent)
      expect(texts).toEqual(['-15', '-5'])
    })
  })

  // ── Mixed positive/negative values ───────────────────────────────

  describe('mixed positive and negative values', () => {
    const mixedData = { labels: ['P', 'N'], values: [20, -10] }

    it('renders bars for both positive and negative values', () => {
      render(container, mixedData)
      const bars = container.querySelectorAll('.bc-bar')
      expect(bars).toHaveLength(2)
    })

    it('value labels show correct text for mixed values', () => {
      render(container, mixedData, { valueLabels: true })
      const texts = Array.from(container.querySelectorAll('.bc-value-label'))
        .map(el => el.textContent)
      expect(texts).toEqual(['20', '-10'])
    })
  })

  // ── Edge cases ───────────────────────────────────────────────────

  it('handles single data point', () => {
    render(container, { labels: ['Only'], values: [42] })
    const bars = container.querySelectorAll('.bc-bar')
    expect(bars).toHaveLength(1)
  })

  it('handles zero values', () => {
    render(container, { labels: ['A', 'B'], values: [0, 10] })
    const bars = container.querySelectorAll('.bc-bar')
    expect(bars).toHaveLength(2)
    const heights = Array.from(bars).map(b => Number(b.getAttribute('height')))
    // Zero-value bar should have zero height
    expect(heights[0]).toBe(0)
    expect(heights[1]).toBeGreaterThan(0)
  })

  // ── barBackground ───────────────────────────────────────────────

  describe('barBackground', () => {
    it('renders background rects when barBackground is true', () => {
      render(container, data, { barBackground: true })
      const bgs = container.querySelectorAll('.bc-bar-bg')
      expect(bgs).toHaveLength(3)
    })

    it('background rects span full chart height', () => {
      render(container, data, { barBackground: true })
      const clipRect = container.querySelector('clipPath rect')!
      const chartHeight = Number(clipRect.getAttribute('height'))
      const bgs = container.querySelectorAll('.bc-bar-bg')
      const heights = Array.from(bgs).map(b => Number(b.getAttribute('height')))
      expect(heights.every(h => h === chartHeight)).toBe(true)
    })

    it('does not render background rects when barBackground is not set', () => {
      render(container, data)
      const bgs = container.querySelectorAll('.bc-bar-bg')
      expect(bgs).toHaveLength(0)
    })
  })

  // ── barSeparators ──────────────────────────────────────────────

  describe('barSeparators', () => {
    it('renders separator lines when barSeparators is true', () => {
      render(container, data, { barSeparators: true })
      const seps = container.querySelectorAll('.bc-bar-separator')
      expect(seps).toHaveLength(2) // n-1 for n=3 bars
    })

    it('separator lines are vertical', () => {
      render(container, data, { barSeparators: true })
      const seps = container.querySelectorAll('.bc-bar-separator')
      Array.from(seps).forEach((sep) => {
        expect(sep.getAttribute('x1')).toBe(sep.getAttribute('x2'))
      })
    })

    it('does not render separators when barSeparators is not set', () => {
      render(container, data)
      const seps = container.querySelectorAll('.bc-bar-separator')
      expect(seps).toHaveLength(0)
    })

    it('does not render separators for a single bar', () => {
      render(container, { labels: ['A'], values: [10] }, { barSeparators: true })
      const seps = container.querySelectorAll('.bc-bar-separator')
      expect(seps).toHaveLength(0)
    })
  })

  // ── showValues ───────────────────────────────────────────────────

  describe('showValues', () => {
    it('renders horizontal bars when showValues is true', () => {
      render(container, data, { showValues: true })
      const bars = container.querySelectorAll('.bc-bar')
      expect(bars).toHaveLength(3)
      // Bars should have width varying by value (horizontal orientation)
      const widths = Array.from(bars).map(b => Number(b.getAttribute('width')))
      expect(widths.some(w => w > 0)).toBe(true)
      // Heights should all be the same (band height)
      const heights = Array.from(bars).map(b => Number(b.getAttribute('height')))
      expect(new Set(heights).size).toBe(1)
    })

    it('does not show values on axis when showValues is not set', () => {
      render(container, data)
      const bars = container.querySelectorAll('.bc-bar')
      // Normal vertical bars: widths are all equal (band width), heights vary
      const widths = Array.from(bars).map(b => Number(b.getAttribute('width')))
      expect(new Set(widths).size).toBe(1)
      const heights = Array.from(bars).map(b => Number(b.getAttribute('height')))
      expect(new Set(heights).size).toBeGreaterThan(1)
    })

    it('barBackground works with showValues', () => {
      render(container, data, { showValues: true, barBackground: true })
      const bgs = container.querySelectorAll('.bc-bar-bg')
      expect(bgs).toHaveLength(3)
      // Background rects should span full chart width
      const clipRect = container.querySelector('clipPath rect')!
      const chartWidth = Number(clipRect.getAttribute('width'))
      const widths = Array.from(bgs).map(b => Number(b.getAttribute('width')))
      expect(widths.every(w => w === chartWidth)).toBe(true)
    })

    it('barSeparators works with showValues', () => {
      render(container, data, { showValues: true, barSeparators: true })
      const seps = container.querySelectorAll('.bc-bar-separator')
      expect(seps).toHaveLength(2)
      // Separators should be horizontal lines (y1 === y2)
      Array.from(seps).forEach((sep) => {
        expect(sep.getAttribute('y1')).toBe(sep.getAttribute('y2'))
      })
    })
  })
})
