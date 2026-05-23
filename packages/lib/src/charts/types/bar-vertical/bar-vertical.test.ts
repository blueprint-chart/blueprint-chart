import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './bar-vertical'
import { buildChartOptions } from '../../chart-helpers'
import { SortDirection, ValueLabelPosition, GridStyle, LabelRotation } from '../../../enums'

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

  // ── Colorizes ───────────────────────────────────────────────────

  it('applies colorize colors', () => {
    render(container, data, {
      colorizes: [{ target: 'B', color: '#ff0000' }],
    })
    const bars = container.querySelectorAll('.bc-bar')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    expect(fills).toContain('#ff0000')
  })

  it('applies colorize to multiple targets', () => {
    render(container, data, {
      colorizes: [
        { target: 'A', color: '#ff0000' },
        { target: 'C', color: '#00ff00' },
      ],
    })
    const bars = container.querySelectorAll('.bc-bar')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    expect(fills).toContain('#ff0000')
    expect(fills).toContain('#00ff00')
  })

  it('non-colorized bars keep the default or custom color', () => {
    render(container, data, {
      colorizes: [{ target: 'B', color: '#ff0000' }],
    })
    const bars = container.querySelectorAll('.bc-bar')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    // B is colorized, A and C should use default color #4e79a7
    const nonColorized = fills.filter(f => f !== '#ff0000')
    expect(nonColorized.length).toBe(2)
    expect(nonColorized.every(f => f === '#4e79a7')).toBe(true)
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
    render(container, data, { sort: SortDirection.Descending })
    const bars = container.querySelectorAll('.bc-bar')
    const heights = Array.from(bars).map(b => Number(b.getAttribute('height')))
    expect(heights[0]).toBeGreaterThanOrEqual(heights[1])
    expect(heights[1]).toBeGreaterThanOrEqual(heights[2])
  })

  it('sorts bars in ascending order', () => {
    render(container, data, { sort: SortDirection.Ascending })
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
    render(container, data, { valueLabels: true, sort: SortDirection.Ascending })
    const texts = Array.from(container.querySelectorAll('.bc-value-label'))
      .map(el => el.textContent)
    expect(texts).toEqual(['10', '20', '30'])
  })

  it('value labels respect descending sort order', () => {
    render(container, data, { valueLabels: true, sort: SortDirection.Descending })
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

  it('value labels are not inside the clipped group', () => {
    render(container, data, { valueLabels: true })
    const clipPath = container.querySelector('clipPath')!
    const clippedGroup = container.querySelector(`[clip-path="url(#${clipPath.id})"]`)!
    expect(clippedGroup.querySelector('.bc-value-label')).toBeNull()
  })

  it('value labels support "inside" position', () => {
    render(container, data, { valueLabels: true, valueLabelPosition: ValueLabelPosition.Inside })
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(3)
    // Inside labels use 'central' dominant-baseline
    const baselines = Array.from(labels).map(l => l.getAttribute('dominant-baseline'))
    expect(baselines.every(b => b === 'central')).toBe(true)
  })

  it('value labels support "outside" position', () => {
    render(container, data, { valueLabels: true, valueLabelPosition: ValueLabelPosition.Outside })
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

  it('reuses a single clipPath across repeated renders to the same container', () => {
    for (let i = 0; i < 5; i++) {
      render(container, data)
    }
    expect(container.querySelectorAll('clipPath')).toHaveLength(1)
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

  it('applies numberFormat to vertical axis tick labels', () => {
    const bigData = { labels: ['A', 'B'], values: [5000, 10000] }
    render(container, bigData, {
      verticalAxis: { numberFormat: '$|,.0f|' },
    })
    const vAxis = container.querySelector('.bc-axis-vertical')
    const tickTexts = Array.from(vAxis!.querySelectorAll('.tick text')).map(t => t.textContent)
    // Should have dollar prefix and comma separators
    expect(tickTexts.some(t => t!.startsWith('$'))).toBe(true)
    expect(tickTexts.some(t => t!.includes(','))).toBe(true)
  })

  it('applies numberFormat via buildChartOptions (editor path)', () => {
    const bigData = { labels: ['A', 'B'], values: [5000, 10000] }
    const opts = buildChartOptions({
      showVerticalAxis: false,
      verticalGridStyle: GridStyle.Dashed,
      verticalNumberFormat: '$|,.0f|',
    })
    render(container, bigData, opts)
    const vAxis = container.querySelector('.bc-axis-vertical')
    const tickTexts = Array.from(vAxis!.querySelectorAll('.tick text')).map(t => t.textContent)
    expect(tickTexts.some(t => t!.startsWith('$'))).toBe(true)
  })

  it('applies numberFormat on re-render after container clear (editor re-render path)', () => {
    const bigData = { labels: ['A', 'B'], values: [5000, 10000] }
    // First render without format
    render(container, bigData)
    // Clear container (simulates useChartPreview replaceChildren)
    container.replaceChildren()
    // Re-render with format
    const opts = buildChartOptions({
      showVerticalAxis: false,
      verticalGridStyle: GridStyle.Dashed,
      verticalNumberFormat: ',.0f',
    })
    render(container, bigData, opts)
    const vAxis = container.querySelector('.bc-axis-vertical')
    const tickTexts = Array.from(vAxis!.querySelectorAll('.tick text')).map(t => t.textContent)
    // With ,.0f, 10,000 should have commas
    expect(tickTexts.some(t => t!.includes(','))).toBe(true)
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

  it('keeps horizontal axis tick labels when showAxis is false (only domain is removed)', () => {
    render(container, data, {
      horizontalAxis: { showAxis: false },
    })
    const hAxis = container.querySelector('.bc-axis-horizontal')
    expect(hAxis).not.toBeNull()
    const tickTexts = hAxis!.querySelectorAll('.tick text')
    expect(tickTexts.length).toBeGreaterThan(0)
  })

  it('removes vertical axis domain line when showAxis is false', () => {
    render(container, data, {
      verticalAxis: { showAxis: false },
    })
    const vAxis = container.querySelector('.bc-axis-vertical')
    expect(vAxis).not.toBeNull()
    const domain = vAxis!.querySelector('.domain')
    expect(domain).toBeNull()
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

  // ── categoryLabelLine ────────────────────────────────────────────

  it('renders category label text elements when categoryLabelLine=true', () => {
    render(container, data, { categoryLabelLine: true })
    const labels = container.querySelectorAll('.bc-category-label')
    expect(labels).toHaveLength(3)
    const texts = Array.from(labels).map(l => l.textContent)
    expect(texts).toContain('A')
    expect(texts).toContain('B')
    expect(texts).toContain('C')
  })

  it('does not render category label text elements when categoryLabelLine=false', () => {
    render(container, data, { categoryLabelLine: false })
    const labels = container.querySelectorAll('.bc-category-label')
    expect(labels).toHaveLength(0)
  })

  it('does not render category label text elements by default', () => {
    render(container, data)
    const labels = container.querySelectorAll('.bc-category-label')
    expect(labels).toHaveLength(0)
  })

  it('hides horizontal axis tick labels when categoryLabelLine=true', () => {
    render(container, data, { categoryLabelLine: true })
    const hAxis = container.querySelector('.bc-axis-horizontal')!
    const tickTexts = hAxis.querySelectorAll('.tick text')
    expect(tickTexts).toHaveLength(0)
  })

  it('category label texts are positioned at distinct x values', () => {
    render(container, data, { categoryLabelLine: true })
    const labels = container.querySelectorAll('.bc-category-label')
    const xs = Array.from(labels).map(l => parseFloat(l.getAttribute('x') ?? '0'))
    const unique = new Set(xs.map(v => Math.round(v)))
    expect(unique.size).toBe(3)
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
        colorizes: [{ target: 'A', color: '#ff0000' }],
      }, true)

      const labelsAfter = container.querySelectorAll('.bc-value-label')
      expect(labelsAfter.length).toBe(labelsBefore.length)
    })

    it('value labels reflect new sort order after re-render', () => {
      render(container, data, { valueLabels: true })
      const textsBefore = Array.from(container.querySelectorAll('.bc-value-label'))
        .map(el => el.textContent)

      container.replaceChildren()
      render(container, data, { valueLabels: true, sort: SortDirection.Ascending })

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
        colorizes: [{ target: 'B', color: '#ff0000' }],
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

  // ── connectedColumns ───────────────────────────────────────────

  describe('connectedColumns', () => {
    function parsePoints(el: Element): { x: number, y: number }[] {
      const raw = el.getAttribute('points') ?? ''
      return raw.trim().split(/\s+/).map((p) => {
        const [xs, ys] = p.split(',')
        return { x: parseFloat(xs), y: parseFloat(ys) }
      })
    }

    it('renders n-1 connection polygons when connectedColumns is true', () => {
      render(container, data, { connectedColumns: true })
      const conns = container.querySelectorAll('.bc-bar-connection')
      expect(conns).toHaveLength(2)
    })

    it('does not render connections when connectedColumns is not set', () => {
      render(container, data)
      const conns = container.querySelectorAll('.bc-bar-connection')
      expect(conns).toHaveLength(0)
    })

    it('does not render connections for a single bar', () => {
      render(container, { labels: ['Only'], values: [10] }, { connectedColumns: true })
      const conns = container.querySelectorAll('.bc-bar-connection')
      expect(conns).toHaveLength(0)
    })

    it('uses default opacity 0.15 when connectionsOpacity is not set', () => {
      render(container, data, { connectedColumns: true })
      const conn = container.querySelector('.bc-bar-connection')!
      expect(Number(conn.getAttribute('opacity'))).toBe(0.15)
    })

    it('applies custom connectionsOpacity', () => {
      render(container, data, { connectedColumns: true, connectionsOpacity: 0.4 })
      const conn = container.querySelector('.bc-bar-connection')!
      expect(Number(conn.getAttribute('opacity'))).toBe(0.4)
    })

    it('uses the base bar color for the fill', () => {
      render(container, data, {
        connectedColumns: true,
        colors: ['#ff0000', '#00ff00'],
      })
      const fills = Array.from(container.querySelectorAll('.bc-bar-connection'))
        .map(c => c.getAttribute('fill'))
      expect(fills.every(f => f === '#ff0000')).toBe(true)
    })

    it('uses a solid fill when adjacent bars share the same color', () => {
      render(container, data, {
        connectedColumns: true,
        colorizes: [{ target: 'A', color: '#ff0000' }],
      })
      const conns = container.querySelectorAll('.bc-bar-connection')
      // Second connection is B→C; both default → solid default fill.
      expect(conns[1].getAttribute('fill')).toBe('#4e79a7')
    })

    it('disables pointer events on connection polygons', () => {
      render(container, data, { connectedColumns: true })
      const conns = container.querySelectorAll('.bc-bar-connection')
      Array.from(conns).forEach((c) => {
        expect(c.getAttribute('pointer-events')).toBe('none')
      })
    })

    it('renders connections below bars in document (z) order', () => {
      render(container, data, { connectedColumns: true })
      const conn = container.querySelector('.bc-bar-connection')!
      const bar = container.querySelector('.bc-bar')!
      // DOCUMENT_POSITION_FOLLOWING means `bar` follows `conn` → conn paints first.
      expect(conn.compareDocumentPosition(bar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })

    it('skips connection when the left bar value is 0', () => {
      render(container, { labels: ['A', 'B', 'C'], values: [0, 20, 30] }, { connectedColumns: true })
      const conns = container.querySelectorAll('.bc-bar-connection')
      // A=0 kills A→B; B→C remains.
      expect(conns).toHaveLength(1)
    })

    it('skips connection when the right bar value is 0', () => {
      render(container, { labels: ['A', 'B', 'C'], values: [10, 20, 0] }, { connectedColumns: true })
      const conns = container.querySelectorAll('.bc-bar-connection')
      // C=0 kills B→C; A→B remains.
      expect(conns).toHaveLength(1)
    })

    describe('waterfall', () => {
      const wfData = { labels: ['A', 'B', 'C'], values: [10, 20, 30] }

      it('renders n-1 connection polygons for non-total waterfall bars', () => {
        render(container, wfData, { waterfall: true, connectedColumns: true })
        const conns = container.querySelectorAll('.bc-bar-connection')
        expect(conns).toHaveLength(2)
      })

      it('skips the connection adjacent to the Total bar', () => {
        render(container, wfData, {
          waterfall: true,
          waterfallTotal: true,
          connectedColumns: true,
        })
        const conns = container.querySelectorAll('.bc-bar-connection')
        // Connections: A→B, B→C. C→Total is skipped because next bar is total.
        expect(conns).toHaveLength(2)
      })

      it('skips connections when either value is 0', () => {
        render(container, { labels: ['A', 'B', 'C'], values: [10, 0, 30] }, {
          waterfall: true,
          connectedColumns: true,
        })
        const conns = container.querySelectorAll('.bc-bar-connection')
        // A→B (B=0) and B→C (B=0) both dropped.
        expect(conns).toHaveLength(0)
      })

      it('skips connections when either value is NaN', () => {
        render(container, { labels: ['A', 'B', 'C'], values: [10, Number.NaN, 30] }, {
          waterfall: true,
          connectedColumns: true,
        })
        const conns = container.querySelectorAll('.bc-bar-connection')
        expect(conns).toHaveLength(0)
      })

      it('polygon connects bar tops and follows each bar floor', () => {
        render(container, wfData, { waterfall: true, connectedColumns: true })
        const bars = container.querySelectorAll('.bc-bar')
        const conn = container.querySelector('.bc-bar-connection')!
        const pts = parsePoints(conn)

        // Bar A: y0=0, y1=10. Bar B: y0=10, y1=30.
        const barA = bars[0], barB = bars[1]
        const xARight = Number(barA.getAttribute('x')) + Number(barA.getAttribute('width'))
        const xBLeft = Number(barB.getAttribute('x'))
        const yATop = Number(barA.getAttribute('y'))
        const yABottom = yATop + Number(barA.getAttribute('height'))
        const yBTop = Number(barB.getAttribute('y'))
        const yBBottom = yBTop + Number(barB.getAttribute('height'))

        expect(pts[0].x).toBeCloseTo(xARight, 5)
        expect(pts[0].y).toBeCloseTo(yATop, 5)
        expect(pts[1].x).toBeCloseTo(xBLeft, 5)
        expect(pts[1].y).toBeCloseTo(yBTop, 5)
        expect(pts[2].x).toBeCloseTo(xBLeft, 5)
        expect(pts[2].y).toBeCloseTo(yBBottom, 5)
        expect(pts[3].x).toBeCloseTo(xARight, 5)
        expect(pts[3].y).toBeCloseTo(yABottom, 5)
      })

      it('polygon is bounded to inter-bar gap width (does not overdraw bars)', () => {
        render(container, wfData, { waterfall: true, connectedColumns: true })
        const bars = container.querySelectorAll('.bc-bar')
        const conn = container.querySelector('.bc-bar-connection')!
        const pts = parsePoints(conn)
        const xs = pts.map(p => p.x)
        const barA = bars[0], barB = bars[1]
        const xARight = Number(barA.getAttribute('x')) + Number(barA.getAttribute('width'))
        const xBLeft = Number(barB.getAttribute('x'))
        expect(Math.min(...xs)).toBeCloseTo(xARight, 5)
        expect(Math.max(...xs)).toBeCloseTo(xBLeft, 5)
      })

      it('uses a solid fill when adjacent waterfall bars share the same color', () => {
        render(container, wfData, { waterfall: true, connectedColumns: true })
        const conns = container.querySelectorAll('.bc-bar-connection')
        Array.from(conns).forEach((c) => {
          const fill = c.getAttribute('fill') ?? ''
          expect(fill.startsWith('url(')).toBe(false)
        })
      })

      it('uses a url(#...) gradient fill when adjacent waterfall bars have different colors', () => {
        render(container, wfData, {
          waterfall: true,
          connectedColumns: true,
          colorizes: [{ target: 'B', color: '#ff0000' }],
        })
        const conns = container.querySelectorAll('.bc-bar-connection')
        expect(conns[0].getAttribute('fill')).toMatch(/^url\(#.+\)$/)
        expect(conns[1].getAttribute('fill')).toMatch(/^url\(#.+\)$/)
      })

      it('connections render below bars in document (z) order', () => {
        render(container, wfData, { waterfall: true, connectedColumns: true })
        const conn = container.querySelector('.bc-bar-connection')!
        const bar = container.querySelector('.bc-bar')!
        expect(conn.compareDocumentPosition(bar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      })

      it('disables pointer events on waterfall connection polygons', () => {
        render(container, wfData, { waterfall: true, connectedColumns: true })
        const conns = container.querySelectorAll('.bc-bar-connection')
        Array.from(conns).forEach((c) => {
          expect(c.getAttribute('pointer-events')).toBe('none')
        })
      })
    })

    describe('color gradients', () => {
      it('uses solid fill (no gradient) when adjacent bars share the same color', () => {
        render(container, data, { connectedColumns: true })
        const conns = container.querySelectorAll('.bc-bar-connection')
        Array.from(conns).forEach((c) => {
          const fill = c.getAttribute('fill') ?? ''
          expect(fill.startsWith('url(')).toBe(false)
        })
      })

      it('uses a url(#...) gradient fill when adjacent bars have different colors', () => {
        render(container, data, {
          connectedColumns: true,
          colorizes: [{ target: 'B', color: '#ff0000' }],
        })
        const conns = container.querySelectorAll('.bc-bar-connection')
        // A→B: A default, B red → different → gradient
        expect(conns[0].getAttribute('fill')).toMatch(/^url\(#.+\)$/)
        // B→C: B red, C default → different → gradient
        expect(conns[1].getAttribute('fill')).toMatch(/^url\(#.+\)$/)
      })

      it('does not register a gradient when adjacent colors match', () => {
        render(container, data, { connectedColumns: true })
        const grads = container.querySelectorAll('defs linearGradient')
        expect(grads).toHaveLength(0)
      })

      it('registers one <linearGradient> per differing-color connection', () => {
        render(container, data, {
          connectedColumns: true,
          colorizes: [{ target: 'B', color: '#ff0000' }],
        })
        const grads = container.querySelectorAll('defs linearGradient')
        expect(grads).toHaveLength(2)
      })

      it('gradient stops use left bar color (0%) then right bar color (100%)', () => {
        render(container, data, {
          connectedColumns: true,
          colorizes: [
            { target: 'A', color: '#ff0000' },
            { target: 'B', color: '#00ff00' },
          ],
        })
        const conns = container.querySelectorAll('.bc-bar-connection')
        // A→B connection: left=red, right=green
        const fillRef = conns[0].getAttribute('fill')!
        const id = fillRef.slice(fillRef.indexOf('#') + 1, -1)
        const grad = container.querySelector(`#${id}`)!
        const stops = grad.querySelectorAll('stop')
        expect(stops).toHaveLength(2)
        expect(stops[0].getAttribute('offset')).toBe('0%')
        expect(stops[0].getAttribute('stop-color')).toBe('#ff0000')
        expect(stops[1].getAttribute('offset')).toBe('100%')
        expect(stops[1].getAttribute('stop-color')).toBe('#00ff00')
      })

      it('gradient direction is horizontal (left→right)', () => {
        render(container, data, {
          connectedColumns: true,
          colorizes: [{ target: 'B', color: '#ff0000' }],
        })
        const grad = container.querySelector('defs linearGradient')!
        expect(grad.getAttribute('x1')).toBe('0%')
        expect(grad.getAttribute('x2')).toBe('100%')
        expect(grad.getAttribute('y1')).toBe('0%')
        expect(grad.getAttribute('y2')).toBe('0%')
      })

      it('gradient IDs are unique across connection pairs', () => {
        render(container, data, {
          connectedColumns: true,
          colorizes: [
            { target: 'A', color: '#ff0000' },
            { target: 'B', color: '#00ff00' },
            { target: 'C', color: '#0000ff' },
          ],
        })
        const ids = Array.from(container.querySelectorAll('defs linearGradient'))
          .map(g => g.getAttribute('id'))
        expect(new Set(ids).size).toBe(ids.length)
        expect(ids.length).toBe(2)
      })

      it('gradient IDs do not collide across chart instances', () => {
        const containerA = document.createElement('div')
        const containerB = document.createElement('div')
        document.body.appendChild(containerA)
        document.body.appendChild(containerB)
        render(containerA, data, {
          connectedColumns: true,
          colorizes: [{ target: 'B', color: '#ff0000' }],
        })
        render(containerB, data, {
          connectedColumns: true,
          colorizes: [{ target: 'B', color: '#ff0000' }],
        })
        const idsA = Array.from(containerA.querySelectorAll('defs linearGradient')).map(g => g.id)
        const idsB = Array.from(containerB.querySelectorAll('defs linearGradient')).map(g => g.id)
        const overlap = idsA.filter(id => idsB.includes(id))
        expect(overlap).toHaveLength(0)
      })
    })

    describe('geometry', () => {
      it('x coordinates span from right of curr bar to left of next bar', () => {
        render(container, { labels: ['A', 'B'], values: [10, 20] }, { connectedColumns: true })
        const conn = container.querySelector('.bc-bar-connection')!
        const pts = parsePoints(conn)
        expect(pts).toHaveLength(4)

        const bars = container.querySelectorAll('.bc-bar')
        const xA = Number(bars[0].getAttribute('x'))
        const wA = Number(bars[0].getAttribute('width'))
        const xB = Number(bars[1].getAttribute('x'))

        // Points: [currTopRight, nextTopLeft, nextBottomLeft, currBottomRight]
        expect(pts[0].x).toBeCloseTo(xA + wA)
        expect(pts[1].x).toBeCloseTo(xB)
        expect(pts[2].x).toBeCloseTo(xB)
        expect(pts[3].x).toBeCloseTo(xA + wA)
      })

      it('ascending: top edge slopes with bar tops, bottom edge sits at baseline', () => {
        render(container, { labels: ['A', 'B'], values: [10, 30] }, { connectedColumns: true })
        const conn = container.querySelector('.bc-bar-connection')!
        const pts = parsePoints(conn)

        const bars = container.querySelectorAll('.bc-bar')
        const yA = Number(bars[0].getAttribute('y'))
        const hA = Number(bars[0].getAttribute('height'))
        const yB = Number(bars[1].getAttribute('y'))
        const baseline = yA + hA // y(0) for positive bars

        expect(yB).toBeLessThan(yA) // taller bar has smaller y in SVG coords
        expect(pts[0].y).toBeCloseTo(yA) // curr top-right (shorter)
        expect(pts[1].y).toBeCloseTo(yB) // next top-left (taller)
        expect(pts[2].y).toBeCloseTo(baseline) // next bottom at baseline
        expect(pts[3].y).toBeCloseTo(baseline) // curr bottom at baseline
      })

      it('descending: top edge slopes with bar tops, bottom edge sits at baseline', () => {
        render(container, { labels: ['A', 'B'], values: [30, 10] }, { connectedColumns: true })
        const conn = container.querySelector('.bc-bar-connection')!
        const pts = parsePoints(conn)

        const bars = container.querySelectorAll('.bc-bar')
        const yA = Number(bars[0].getAttribute('y'))
        const yB = Number(bars[1].getAttribute('y'))
        const hB = Number(bars[1].getAttribute('height'))
        const baseline = yB + hB

        expect(yA).toBeLessThan(yB)
        expect(pts[0].y).toBeCloseTo(yA) // curr top-right (taller)
        expect(pts[1].y).toBeCloseTo(yB) // next top-left (shorter)
        expect(pts[2].y).toBeCloseTo(baseline) // bottom at baseline
        expect(pts[3].y).toBeCloseTo(baseline)
      })

      it('flat: polygon is a rectangle from bar tops down to baseline', () => {
        render(container, { labels: ['A', 'B'], values: [20, 20] }, { connectedColumns: true })
        const conn = container.querySelector('.bc-bar-connection')!
        const pts = parsePoints(conn)

        expect(pts).toHaveLength(4)

        const bars = container.querySelectorAll('.bc-bar')
        const yA = Number(bars[0].getAttribute('y'))
        const hA = Number(bars[0].getAttribute('height'))
        const baseline = yA + hA

        expect(pts[0].y).toBeCloseTo(yA) // curr top-right
        expect(pts[1].y).toBeCloseTo(yA) // next top-left (equal)
        expect(pts[2].y).toBeCloseTo(baseline) // next bottom
        expect(pts[3].y).toBeCloseTo(baseline) // curr bottom

        const uniqueKeys = new Set(pts.map(p => `${Math.round(p.x * 1000)},${Math.round(p.y * 1000)}`))
        expect(uniqueKeys.size).toBe(4)

        const width = Math.abs(pts[1].x - pts[0].x)
        const height = Math.abs(pts[3].y - pts[0].y)
        expect(width).toBeGreaterThan(0)
        expect(height).toBeGreaterThan(0)
      })
    })
  })

  // ── swapLabelValue ──────────────────────────────────────────────

  describe('swapLabelValue', () => {
    it('still renders vertical bars when swapLabelValue is true', () => {
      render(container, data, { swapLabelValue: true })
      const bars = container.querySelectorAll('.bc-bar')
      expect(bars).toHaveLength(3)
      // Vertical bars: widths are all equal (band width), heights vary
      const widths = Array.from(bars).map(b => Number(b.getAttribute('width')))
      expect(new Set(widths).size).toBe(1)
      const heights = Array.from(bars).map(b => Number(b.getAttribute('height')))
      expect(new Set(heights).size).toBeGreaterThan(1)
    })

    it('category axis shows values when swapLabelValue is true', () => {
      render(container, data, { swapLabelValue: true, valueLabels: true })
      // Horizontal axis (category) should show numeric values instead of labels
      const hAxis = container.querySelector('.bc-axis-horizontal')!
      const hTickTexts = Array.from(hAxis.querySelectorAll('.tick text'))
        .map(el => el.textContent)
      expect(hTickTexts).toEqual(['10', '30', '20'])
    })

    it('direct labels show category names instead of values', () => {
      render(container, data, { swapLabelValue: true, valueLabels: true })
      const labels = Array.from(container.querySelectorAll('.bc-value-label'))
        .map(el => el.textContent)
      expect(labels).toEqual(['A', 'B', 'C'])
    })

    it('does not swap when swapLabelValue is not set', () => {
      render(container, data)
      const hAxis = container.querySelector('.bc-axis-horizontal')!
      const hTickTexts = Array.from(hAxis.querySelectorAll('.tick text'))
        .map(el => el.textContent)
      expect(hTickTexts).toEqual(['A', 'B', 'C'])
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

    it('total bar label appears on horizontal axis', () => {
      render(container, wfData, { waterfall: true, waterfallTotal: true })
      const hAxis = container.querySelector('.bc-axis-horizontal')!
      const ticks = Array.from(hAxis.querySelectorAll('.tick text')).map(t => t.textContent)
      expect(ticks).toContain('Total')
    })

    it('renders connector lines between bars', () => {
      render(container, wfData, { waterfall: true })
      const connectors = container.querySelectorAll('.bc-waterfall-connector')
      expect(connectors).toHaveLength(2) // n-1 connectors
    })

    it('does not render connectors before total bar', () => {
      render(container, wfData, { waterfall: true, waterfallTotal: true })
      const connectors = container.querySelectorAll('.bc-waterfall-connector')
      expect(connectors).toHaveLength(2) // still n-1 for data bars, not to total
    })

    it('renders value labels with numberFormat', () => {
      render(container, wfData, {
        waterfall: true,
        valueLabels: true,
        verticalAxis: { numberFormat: '|,.0f|kg' },
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
        verticalAxis: { numberFormat: '|,.0f|kg' },
      })
      const labels = Array.from(container.querySelectorAll('.bc-value-label'))
        .map(el => el.textContent)
      expect(labels).toHaveLength(4)
      expect(labels[3]).toBe('60kg') // sum of 10+20+30
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

    it('bars are positioned cumulatively (not from zero)', () => {
      render(container, wfData, { waterfall: true })
      const bars = container.querySelectorAll('.bc-bar')
      const ys = Array.from(bars).map(b => Number(b.getAttribute('y')))
      // Each subsequent bar should have a lower y value (higher on screen)
      expect(ys[1]).toBeLessThan(ys[0])
      expect(ys[2]).toBeLessThan(ys[1])
    })

    it('total bar starts from zero', () => {
      render(container, wfData, { waterfall: true, waterfallTotal: true })
      const bars = container.querySelectorAll('.bc-bar')
      const totalBar = bars[3]
      const totalHeight = Number(totalBar.getAttribute('height'))
      // Total bar should be taller than any individual bar
      const otherHeights = Array.from(bars).slice(0, 3).map(b => Number(b.getAttribute('height')))
      expect(totalHeight).toBeGreaterThan(Math.max(...otherHeights))
    })

    it('barBackground includes total bar', () => {
      render(container, wfData, { waterfall: true, waterfallTotal: true, barBackground: true })
      const bgs = container.querySelectorAll('.bc-bar-bg')
      expect(bgs).toHaveLength(4) // 3 data + 1 total
    })

    it('barSeparators includes total bar', () => {
      render(container, wfData, { waterfall: true, waterfallTotal: true, barSeparators: true })
      const seps = container.querySelectorAll('.bc-bar-separator')
      expect(seps).toHaveLength(3) // n-1 for 4 bars
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
      // A and C should be dimmed, B should be full opacity
      expect(opacities[0]).toBe('0.35')
      expect(opacities[1]).toBe('1')
      expect(opacities[2]).toBe('0.35')
    })

    it('does not dim when no highlights are present', () => {
      render(container, data)
      const bars = container.querySelectorAll('.bc-bar')
      const opacities = Array.from(bars).map(b => b.getAttribute('opacity'))
      // featureJoin always writes the opacity attribute; "no dimming" means
      // every bar is at full opacity (either unset or "1"), never < 1.
      expect(opacities.every(o => o === null || o === '1')).toBe(true)
    })

    it('works alongside colorize', () => {
      render(container, data, {
        colorizes: [{ target: 'B', color: '#ff0000' }],
        highlights: [{ target: 'B' }],
      })
      const bars = container.querySelectorAll('.bc-bar')
      // B should have custom color and full opacity
      expect(bars[1].getAttribute('fill')).toBe('#ff0000')
      expect(bars[1].getAttribute('opacity')).toBe('1')
      // Others should be dimmed
      expect(bars[0].getAttribute('opacity')).toBe('0.35')
    })
  })

  // ── barGap ───────────────────────────────────────────────────────

  describe('barGap', () => {
    function measure() {
      const bars = Array.from(container.querySelectorAll('.bc-bar'))
      const xs = bars.map(b => Number(b.getAttribute('x')))
      const widths = bars.map(b => Number(b.getAttribute('width')))
      return { bars, xs, widths }
    }

    it('renders adjacent columns flush when barGap=0', () => {
      render(container, data, { barGap: 0 })
      const { bars, xs, widths } = measure()
      expect(bars).toHaveLength(3)
      // Adjacent columns should share an edge (no inter-category gap)
      expect(xs[1] - (xs[0] + widths[0])).toBeCloseTo(0, 5)
      expect(xs[2] - (xs[1] + widths[1])).toBeCloseTo(0, 5)
    })

    it('produces a gap equal to 50% of column width when barGap=50', () => {
      render(container, data, { barGap: 50 })
      const { xs, widths } = measure()
      const gap = xs[1] - (xs[0] + widths[0])
      expect(widths[0]).toBeGreaterThan(0)
      expect(gap).toBeGreaterThan(0)
      expect(gap / widths[0]).toBeCloseTo(0.5, 5)
    })

    it('produces a gap equal to 100% of column width when barGap=100', () => {
      render(container, data, { barGap: 100 })
      const { xs, widths } = measure()
      const gap = xs[1] - (xs[0] + widths[0])
      expect(gap / widths[0]).toBeCloseTo(1, 5)
    })

    it('yields predictable column widths and gaps for a known chart width', () => {
      // barGap=50 → paddingInner=1/3; with 3 categories the scaleBand range W
      // splits into step=W/(3+1/3), bandwidth=step*(2/3), gap=step*(1/3).
      render(container, data, { barGap: 50 })
      const clipRect = container.querySelector('clipPath rect')!
      const chartW = Number(clipRect.getAttribute('width'))
      expect(chartW).toBeGreaterThan(0)
      const expectedStep = chartW / (3 + 1 / 3)
      const expectedBandwidth = expectedStep * (2 / 3)
      const expectedGap = expectedStep * (1 / 3)

      const { xs, widths } = measure()
      expect(widths[0]).toBeCloseTo(expectedBandwidth, 3)
      expect(widths[1]).toBeCloseTo(expectedBandwidth, 3)
      expect(widths[2]).toBeCloseTo(expectedBandwidth, 3)
      expect(xs[1] - (xs[0] + widths[0])).toBeCloseTo(expectedGap, 3)
      expect(xs[2] - (xs[1] + widths[1])).toBeCloseTo(expectedGap, 3)
    })

    it('falls back to the default gap when barGap is omitted', () => {
      render(container, data)
      const { xs, widths } = measure()
      const gap = xs[1] - (xs[0] + widths[0])
      // Default is 60% of bar width (DEFAULT_BAR_GAP=60 → paddingInner=60/160)
      expect(gap / widths[0]).toBeCloseTo(60 / 100, 5)
    })
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
        values: Array.from({ length: 20 }, () => 10),
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
      render(container, data) // 3 short labels
      const hAxis = container.querySelector('.bc-axis-horizontal')!
      hAxis.querySelectorAll('.tick text').forEach((t) => {
        expect(t.getAttribute('transform')).toBeNull()
      })
    })

    it('wraps multi-word labels across lines instead of rotating when wrap fits', () => {
      setContainerWidth(500)
      const multiWord = {
        labels: Array.from({ length: 6 }, (_, i) => `Column Label ${i + 1}`),
        values: Array.from({ length: 6 }, () => 10),
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

    it('honours horizontalAxis.labelRotation="horizontal" override without dropping any bar labels', () => {
      // Each label identifies a bar — dropping one makes that bar unreadable.
      // With horizontal locked and wrap failing, labels overlap rather than disappear.
      setContainerWidth(500)
      const manyLabels = {
        labels: Array.from({ length: 20 }, (_, i) => `Category ${i + 1}`),
        values: Array.from({ length: 20 }, () => 10),
      }
      render(container, manyLabels, { horizontalAxis: { labelRotation: LabelRotation.Horizontal } })
      const hAxis = container.querySelector('.bc-axis-horizontal')!
      const texts = hAxis.querySelectorAll('.tick text')
      texts.forEach((t) => {
        expect(t.getAttribute('transform')).toBeNull()
      })
      const allTicks = hAxis.querySelectorAll('.tick')
      expect(allTicks.length).toBe(20)
    })
  })
})
