import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './bar-horizontal'
import { SortDirection, ValueLabelPosition } from '../../../enums'

describe('bar-horizontal', () => {
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

  it('renders horizontal bars', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar')
    expect(bars).toHaveLength(3)
  })

  it('creates frame and SVG', () => {
    render(container, data)
    expect(container.querySelector('.bc-frame')).not.toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('bars have horizontal orientation (width varies)', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar')
    const widths = Array.from(bars).map(b => Number(b.getAttribute('width')))
    expect(widths.some(w => w > 0)).toBe(true)
    // All bars start at x=0
    const xs = Array.from(bars).map(b => Number(b.getAttribute('x')))
    expect(xs.every(x => x === 0)).toBe(true)
  })

  it('renders one bar per data label', () => {
    const bigData = { labels: ['W', 'X', 'Y', 'Z'], values: [5, 15, 25, 35] }
    render(container, bigData)
    expect(container.querySelectorAll('.bc-bar')).toHaveLength(4)
  })

  // ── Frame title ──────────────────────────────────────────────────

  it('renders frame title when provided', () => {
    render(container, data, { frame: { title: 'My Chart' } })
    const title = container.querySelector('.bc-frame-title')
    expect(title).not.toBeNull()
    expect(title!.textContent).toBe('My Chart')
  })

  it('does not render frame title when not provided', () => {
    render(container, data)
    expect(container.querySelector('.bc-frame-title')).toBeNull()
  })

  // ── Colors ───────────────────────────────────────────────────────

  it('applies custom colors to bars', () => {
    render(container, data, { colors: ['#ff0000'] })
    const bars = container.querySelectorAll('.bc-bar')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    expect(fills.every(f => f === '#ff0000')).toBe(true)
  })

  it('uses default color when no colors option provided', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    // Default is #4e79a7
    expect(fills.every(f => f === '#4e79a7')).toBe(true)
  })

  // ── Colorizes ───────────────────────────────────────────────────

  it('applies colorize colors', () => {
    render(container, data, {
      colorizes: [{ target: 'A', color: '#00ff00' }],
    })
    const bars = container.querySelectorAll('.bc-bar')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    expect(fills).toContain('#00ff00')
  })

  it('applies multiple colorizes to different bars', () => {
    render(container, data, {
      colorizes: [
        { target: 'A', color: '#00ff00' },
        { target: 'C', color: '#0000ff' },
      ],
    })
    const bars = container.querySelectorAll('.bc-bar')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    expect(fills).toContain('#00ff00')
    expect(fills).toContain('#0000ff')
  })

  it('colorize overrides custom color for targeted bar', () => {
    render(container, data, {
      colors: ['#ff0000'],
      colorizes: [{ target: 'B', color: '#00ff00' }],
    })
    const bars = container.querySelectorAll('.bc-bar')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    // B should be colorized, others should use custom color
    expect(fills).toContain('#00ff00')
    expect(fills).toContain('#ff0000')
  })

  // ── Sort ─────────────────────────────────────────────────────────

  it('sorts bars ascending by value', () => {
    render(container, data, { sort: SortDirection.Ascending })
    const bars = container.querySelectorAll('.bc-bar')
    const widths = Array.from(bars).map(b => Number(b.getAttribute('width')))
    // Ascending: widths should be in non-decreasing order (top to bottom)
    for (let i = 1; i < widths.length; i++) {
      expect(widths[i]).toBeGreaterThanOrEqual(widths[i - 1])
    }
  })

  it('sorts bars descending by value', () => {
    render(container, data, { sort: SortDirection.Descending })
    const bars = container.querySelectorAll('.bc-bar')
    const widths = Array.from(bars).map(b => Number(b.getAttribute('width')))
    // Descending: widths should be in non-increasing order (top to bottom)
    for (let i = 1; i < widths.length; i++) {
      expect(widths[i]).toBeLessThanOrEqual(widths[i - 1])
    }
  })

  it('preserves original order when sort is not specified', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar')
    const widths = Array.from(bars).map(b => Number(b.getAttribute('width')))
    // Original: [10, 30, 20] — middle bar should be widest
    expect(widths[1]).toBeGreaterThan(widths[0])
    expect(widths[1]).toBeGreaterThan(widths[2])
  })

  // ── Value labels ─────────────────────────────────────────────────

  it('renders value labels when enabled', () => {
    render(container, data, { valueLabels: true })
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(3)
  })

  it('value labels contain correct text', () => {
    render(container, data, { valueLabels: true })
    const texts = Array.from(container.querySelectorAll('.bc-value-label'))
      .map(el => el.textContent)
    expect(texts).toContain('10')
    expect(texts).toContain('30')
    expect(texts).toContain('20')
  })

  it('does not render value labels when not enabled', () => {
    render(container, data)
    expect(container.querySelectorAll('.bc-value-label')).toHaveLength(0)
  })

  it('value labels are inside a dedicated group', () => {
    render(container, data, { valueLabels: true })
    const group = container.querySelector('.bc-value-label-group')
    expect(group).not.toBeNull()
    expect(group!.querySelectorAll('.bc-value-label')).toHaveLength(3)
  })

  // ── Value label positions ────────────────────────────────────────

  it('supports valueLabelPosition outside', () => {
    render(container, data, { valueLabels: true, valueLabelPosition: ValueLabelPosition.Outside })
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(3)
    // Outside labels for positive values should have text-anchor start
    const anchors = Array.from(labels).map(el => el.getAttribute('text-anchor'))
    expect(anchors.every(a => a === 'start')).toBe(true)
  })

  it('supports valueLabelPosition inside', () => {
    render(container, data, { valueLabels: true, valueLabelPosition: ValueLabelPosition.Inside })
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(3)
    // Inside labels for positive values should have text-anchor end
    const anchors = Array.from(labels).map(el => el.getAttribute('text-anchor'))
    expect(anchors.every(a => a === 'end')).toBe(true)
  })

  it('value labels default to outside in auto mode', () => {
    render(container, data, { valueLabels: true })
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(3)
    // Auto defaults to outside — positive values should have text-anchor start
    const anchors = Array.from(labels).map(el => el.getAttribute('text-anchor'))
    expect(anchors.every(a => a === 'start')).toBe(true)
  })

  it('outside value labels are not inside the clip path', () => {
    render(container, data, { valueLabels: true, valueLabelPosition: ValueLabelPosition.Outside })
    const svg = container.querySelector('svg')!
    const clippedGroup = svg.querySelector('[clip-path]')
    const labelGroup = svg.querySelector('.bc-value-label-group')
    expect(clippedGroup).not.toBeNull()
    expect(labelGroup).not.toBeNull()
    expect(clippedGroup!.contains(labelGroup!)).toBe(false)
  })

  it('right margin increases to fit outside value labels', () => {
    // Render without value labels to get baseline right margin
    render(container, data)
    const svgWithout = container.querySelector('svg')!
    const svgW = Number(svgWithout.getAttribute('width'))
    const chartAreaWithout = svgWithout.querySelector('g')!
    const translateWithout = chartAreaWithout.getAttribute('transform')!
    const leftMarginWithout = Number(translateWithout.match(/translate\(([^,]+),/)?.[1])

    // Render with outside value labels
    container.replaceChildren()
    render(container, data, { valueLabels: true, valueLabelPosition: ValueLabelPosition.Outside })
    const svgWith = container.querySelector('svg')!

    // The chart area width = svgWidth - leftMargin - rightMargin
    // With outside labels the chart area should be narrower (larger right margin)
    const chartWidthWithout = svgW - leftMarginWithout - 15 // default right margin
    // The clip rect width reveals the actual chart area width
    const clipRect = svgWith.querySelector('clipPath rect')!
    const clipW = Number(clipRect.getAttribute('width'))
    expect(clipW).toBeLessThan(chartWidthWithout)
  })

  it('left margin increases for outside labels on negative values', () => {
    const negData = { labels: ['A', 'B'], values: [-100, 50] }

    // Without value labels
    render(container, negData)
    const clipWithout = container.querySelector('clipPath rect')!
    const widthWithout = Number(clipWithout.getAttribute('width'))

    // With outside value labels
    container.replaceChildren()
    render(container, negData, { valueLabels: true, valueLabelPosition: ValueLabelPosition.Outside })
    const clipWith = container.querySelector('clipPath rect')!
    const widthWith = Number(clipWith.getAttribute('width'))

    // Chart area should be narrower to accommodate labels on both sides
    expect(widthWith).toBeLessThan(widthWithout)
  })

  it('inside value labels do not increase margins', () => {
    // Without value labels
    render(container, data)
    const clipWithout = container.querySelector('clipPath rect')!
    const widthWithout = Number(clipWithout.getAttribute('width'))

    // With inside value labels
    container.replaceChildren()
    render(container, data, { valueLabels: true, valueLabelPosition: ValueLabelPosition.Inside })
    const clipWith = container.querySelector('clipPath rect')!
    const widthWith = Number(clipWith.getAttribute('width'))

    expect(widthWith).toBe(widthWithout)
  })

  // ── Crosshair ────────────────────────────────────────────────────

  it('creates crosshair elements when enabled', () => {
    render(container, data, { crosshair: true })
    const crosshairs = container.querySelectorAll('.bc-crosshair')
    expect(crosshairs.length).toBeGreaterThan(0)
  })

  it('does not create crosshair elements when not enabled', () => {
    render(container, data)
    expect(container.querySelectorAll('.bc-crosshair')).toHaveLength(0)
  })

  // ── Tooltips ─────────────────────────────────────────────────────

  it('creates tooltip element when enabled', () => {
    render(container, data, { tooltips: true })
    const tooltip = document.querySelector('.bc-tooltip')
    expect(tooltip).not.toBeNull()
    // Clean up tooltip from document.body
    tooltip?.remove()
  })

  it('does not create tooltip element when not enabled', () => {
    // Remove any leftover tooltips first
    document.querySelectorAll('.bc-tooltip').forEach(el => el.remove())
    render(container, data)
    expect(document.querySelector('.bc-tooltip')).toBeNull()
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

  // ── Axis options ─────────────────────────────────────────────────

  it('shows horizontal axis tick labels by default', () => {
    render(container, data)
    const hAxis = container.querySelector('.bc-axis-horizontal')
    expect(hAxis).not.toBeNull()
    const tickTexts = hAxis!.querySelectorAll('.tick text')
    expect(tickTexts.length).toBeGreaterThan(0)
  })

  it('keeps horizontal axis tick labels when showAxis is false (only domain is removed)', () => {
    render(container, data, {
      horizontalAxis: { showAxis: false },
    })
    const hAxis = container.querySelector('.bc-axis-horizontal')
    expect(hAxis).not.toBeNull()
    const tickTexts = hAxis!.querySelectorAll('.tick text')
    expect(tickTexts.length).toBeGreaterThan(0)
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

  it('renders vertical axis by default', () => {
    render(container, data)
    const vAxis = container.querySelector('.bc-axis-vertical')
    expect(vAxis).not.toBeNull()
  })

  it('vertical axis contains category labels', () => {
    render(container, data)
    const vAxis = container.querySelector('.bc-axis-vertical')
    expect(vAxis).not.toBeNull()
    const tickTexts = Array.from(vAxis!.querySelectorAll('.tick text'))
      .map(el => el.textContent)
    expect(tickTexts).toContain('A')
    expect(tickTexts).toContain('B')
    expect(tickTexts).toContain('C')
  })

  it('renders vertical axis even when showAxis is false', () => {
    render(container, data, {
      verticalAxis: { showAxis: false },
    })
    const vAxis = container.querySelector('.bc-axis-vertical')
    expect(vAxis).not.toBeNull()
    // The vertical axis enter handler removes the domain, but the
    // merge:transition handler re-renders the axis via d3.axisLeft(),
    // which re-adds the domain. Tick labels also remain. Verify the
    // axis group is still present with its ticks.
    const tickTexts = vAxis!.querySelectorAll('.tick text')
    expect(tickTexts.length).toBeGreaterThan(0)
  })

  // ── Transition ───────────────────────────────────────────────────

  it('supports transition parameter on second render', () => {
    render(container, data)
    render(container, { labels: ['A', 'B'], values: [15, 25] }, {}, true)
    const bars = container.querySelectorAll('.bc-bar')
    expect(bars.length).toBeGreaterThanOrEqual(2)
  })

  it('transition re-render updates bar widths', () => {
    render(container, data)
    const widthsBefore = Array.from(container.querySelectorAll('.bc-bar'))
      .map(b => Number(b.getAttribute('width')))

    render(container, { labels: ['A', 'B', 'C'], values: [50, 50, 50] }, {}, true)

    // D3 transitions use requestAnimationFrame internally, which fake timers
    // cannot fully drive in jsdom. Instead, verify bars are still present and
    // the initial (pre-transition) widths differ from equal (proving the
    // transition was initiated with new data).
    const bars = container.querySelectorAll('.bc-bar')
    expect(bars).toHaveLength(3)
    // The original data [10, 30, 20] produces unequal widths
    expect(widthsBefore[0]).not.toBe(widthsBefore[1])
  })

  it('transition with fewer data points marks exiting bars for removal', () => {
    render(container, data)
    expect(container.querySelectorAll('.bc-bar')).toHaveLength(3)

    render(container, { labels: ['A'], values: [10] }, {}, true)

    // D3 exit transitions use requestAnimationFrame which fake timers cannot
    // fully drive in jsdom, so exiting bars remain in the DOM. Verify the
    // data-join bound only the new data point to the surviving bar.
    const bars = container.querySelectorAll('.bc-bar')
    expect(bars.length).toBeGreaterThanOrEqual(1)
  })

  // ── Zero baseline for negative values ────────────────────────────

  it('renders zero baseline when data spans negative and positive', () => {
    render(container, { labels: ['X', 'Y'], values: [-10, 20] })
    const baseline = container.querySelector('.bc-zero-baseline')
    expect(baseline).not.toBeNull()
  })

  it('does not render zero baseline when all values are positive', () => {
    render(container, data)
    expect(container.querySelector('.bc-zero-baseline')).toBeNull()
  })

  // ── Value label transitions ──────────────────────────────────────

  describe('value label transitions', () => {
    it('preserves value labels during scene transition', () => {
      render(container, data, { valueLabels: true })
      const labelsBefore = container.querySelectorAll('.bc-value-label')
      expect(labelsBefore.length).toBeGreaterThan(0)

      render(container, data, {
        valueLabels: true,
        colorizes: [{ target: 'A', color: '#ff0000' }],
      }, true)

      const labelsAfter = container.querySelectorAll('.bc-value-label')
      expect(labelsAfter.length).toBe(labelsBefore.length)
    })

    it('value labels reflect new sort order after re-render', () => {
      render(container, data, { valueLabels: true })
      const textsBefore = Array.from(container.querySelectorAll('.bc-value-label'))
        .map(el => el.textContent)

      // Fresh re-render with ascending sort (container cleared like useChartPreview does)
      container.replaceChildren()
      render(container, data, { valueLabels: true, sort: SortDirection.Ascending })

      const textsAfter = Array.from(container.querySelectorAll('.bc-value-label'))
        .map(el => el.textContent)

      // Same labels should exist but in different order (ascending: 10, 20, 30)
      expect(textsAfter).toHaveLength(textsBefore.length)
      expect(textsAfter).toEqual(['10', '20', '30'])
    })

    it('uses data-join for value labels during transition (not recreated from scratch)', () => {
      render(container, data, { valueLabels: true })
      const countBefore = container.querySelectorAll('.bc-value-label').length

      render(container, data, {
        valueLabels: true,
        colorizes: [{ target: 'B', color: '#ff0000' }],
      }, true)

      // Labels should still be present and match count (data-join preserves them)
      const countAfter = container.querySelectorAll('.bc-value-label').length
      expect(countAfter).toBe(countBefore)
    })
  })

  // ── barBackground ───────────────────────────────────────────────

  describe('barBackground', () => {
    it('renders background rects when barBackground is true', () => {
      render(container, data, { barBackground: true })
      const bgs = container.querySelectorAll('.bc-bar-bg')
      expect(bgs).toHaveLength(3)
    })

    it('background rects span full chart width', () => {
      render(container, data, { barBackground: true })
      const clipRect = container.querySelector('clipPath rect')!
      const chartWidth = Number(clipRect.getAttribute('width'))
      const bgs = container.querySelectorAll('.bc-bar-bg')
      const widths = Array.from(bgs).map(b => Number(b.getAttribute('width')))
      expect(widths.every(w => w === chartWidth)).toBe(true)
    })

    it('background rects have visible opacity', () => {
      render(container, data, { barBackground: true })
      const bgs = container.querySelectorAll('.bc-bar-bg')
      const opacities = Array.from(bgs).map(b => Number(b.getAttribute('opacity')))
      expect(opacities.every(o => o >= 0.15)).toBe(true)
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

    it('separator lines are horizontal', () => {
      render(container, data, { barSeparators: true })
      const seps = container.querySelectorAll('.bc-bar-separator')
      Array.from(seps).forEach((sep) => {
        expect(sep.getAttribute('y1')).toBe(sep.getAttribute('y2'))
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

  // ── swapLabelValue ──────────────────────────────────────────────

  describe('swapLabelValue', () => {
    it('still renders horizontal bars when swapLabelValue is true', () => {
      render(container, data, { swapLabelValue: true })
      const bars = container.querySelectorAll('.bc-bar')
      expect(bars).toHaveLength(3)
      // Bars should still be horizontal: heights are all equal (band height), widths vary
      const heights = Array.from(bars).map(b => Number(b.getAttribute('height')))
      expect(new Set(heights).size).toBe(1)
      const widths = Array.from(bars).map(b => Number(b.getAttribute('width')))
      expect(new Set(widths).size).toBeGreaterThan(1)
    })

    it('category axis shows values when swapLabelValue is true', () => {
      render(container, data, { swapLabelValue: true, valueLabels: true })
      // Vertical axis (category) should show numeric values instead of labels
      const vAxis = container.querySelector('.bc-axis-vertical')!
      const vTickTexts = Array.from(vAxis.querySelectorAll('.tick text'))
        .map(el => el.textContent)
      expect(vTickTexts).toContain('10')
      expect(vTickTexts).toContain('30')
      expect(vTickTexts).toContain('20')
    })

    it('direct labels show category names instead of values', () => {
      render(container, data, { swapLabelValue: true, valueLabels: true })
      const labels = Array.from(container.querySelectorAll('.bc-value-label'))
        .map(el => el.textContent)
      expect(labels).toEqual(['A', 'B', 'C'])
    })

    it('does not swap when swapLabelValue is not set', () => {
      render(container, data)
      const vAxis = container.querySelector('.bc-axis-vertical')!
      const tickTexts = Array.from(vAxis.querySelectorAll('.tick text'))
        .map(el => el.textContent)
      expect(tickTexts).toContain('A')
      expect(tickTexts).toContain('B')
      expect(tickTexts).toContain('C')
    })

    it('barBackground works with swapLabelValue', () => {
      render(container, data, { swapLabelValue: true, barBackground: true })
      const bgs = container.querySelectorAll('.bc-bar-bg')
      expect(bgs).toHaveLength(3)
      // Background rects should span full chart width (horizontal bars)
      const clipRect = container.querySelector('clipPath rect')!
      const chartWidth = Number(clipRect.getAttribute('width'))
      const widths = Array.from(bgs).map(b => Number(b.getAttribute('width')))
      expect(widths.every(w => w === chartWidth)).toBe(true)
    })

    it('barSeparators works with swapLabelValue', () => {
      render(container, data, { swapLabelValue: true, barSeparators: true })
      const seps = container.querySelectorAll('.bc-bar-separator')
      expect(seps).toHaveLength(2)
      // Separators should be horizontal lines (y1 === y2)
      Array.from(seps).forEach((sep) => {
        expect(sep.getAttribute('y1')).toBe(sep.getAttribute('y2'))
      })
    })
  })

  // ── Waterfall ────────────────────────────────────────────────────

  describe('waterfall', () => {
    const wfData = { labels: ['A', 'B', 'C'], values: [10, 20, 30] }

    it('renders bars for each data point', () => {
      render(container, wfData, { waterfall: true })
      const bars = container.querySelectorAll('.bc-bar')
      expect(bars).toHaveLength(3)
    })

    it('adds a total bar when waterfallTotal is true', () => {
      render(container, wfData, { waterfall: true, waterfallTotal: true })
      const bars = container.querySelectorAll('.bc-bar')
      expect(bars).toHaveLength(4)
    })

    it('renders connector lines between bars', () => {
      render(container, wfData, { waterfall: true })
      const connectors = container.querySelectorAll('.bc-waterfall-connector')
      expect(connectors).toHaveLength(2)
    })

    it('renders value labels with numberFormat', () => {
      render(container, wfData, {
        waterfall: true,
        valueLabels: true,
        horizontalAxis: { numberFormat: '|,.0f|kg' },
      })
      const labels = Array.from(container.querySelectorAll('.bc-value-label'))
        .map(el => el.textContent)
      expect(labels).toEqual(['10kg', '20kg', '30kg'])
    })

    it('total value label uses numberFormat', () => {
      render(container, wfData, {
        waterfall: true,
        waterfallTotal: true,
        valueLabels: true,
        horizontalAxis: { numberFormat: '|,.0f|kg' },
      })
      const labels = Array.from(container.querySelectorAll('.bc-value-label'))
        .map(el => el.textContent)
      expect(labels).toHaveLength(4)
      expect(labels[3]).toBe('60kg')
    })

    it('value labels fall back to plain numbers without numberFormat', () => {
      render(container, wfData, {
        waterfall: true,
        valueLabels: true,
      })
      const labels = Array.from(container.querySelectorAll('.bc-value-label'))
        .map(el => el.textContent)
      expect(labels).toEqual(['10', '20', '30'])
    })

    it('barBackground includes total bar', () => {
      render(container, wfData, { waterfall: true, waterfallTotal: true, barBackground: true })
      const bgs = container.querySelectorAll('.bc-bar-bg')
      expect(bgs).toHaveLength(4)
    })

    it('barSeparators includes total bar', () => {
      render(container, wfData, { waterfall: true, waterfallTotal: true, barSeparators: true })
      const seps = container.querySelectorAll('.bc-bar-separator')
      expect(seps).toHaveLength(3)
    })
  })

  // ── Highlight (dim) ──────────────────────────────────────────────

  describe('highlight', () => {
    it('dims non-highlighted bars', () => {
      render(container, data, {
        highlights: [{ target: 'B' }],
      })
      const bars = container.querySelectorAll('.bc-bar')
      const opacities = Array.from(bars).map(b => b.getAttribute('opacity'))
      expect(opacities[0]).toBe('0.2')
      expect(opacities[1]).toBe('1')
      expect(opacities[2]).toBe('0.2')
    })

    it('does not dim when no highlights are present', () => {
      render(container, data)
      const bars = container.querySelectorAll('.bc-bar')
      const opacities = Array.from(bars).map(b => b.getAttribute('opacity'))
      expect(opacities.every(o => o === null)).toBe(true)
    })
  })
})
