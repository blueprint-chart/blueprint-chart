import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './bar-grouped'

describe('bar-grouped', () => {
  let container: HTMLElement

  const data = {
    labels: ['USA', 'China', 'Japan'],
    values: [],
    series: [
      { name: 'Solar', values: [200, 680, 90] },
      { name: 'Wind', values: [180, 540, 50] },
      { name: 'Hydro', values: [190, 840, 80] },
    ],
  }

  beforeEach(() => {
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.useRealTimers()
  })

  // ── Basic rendering ──────────────────────────────────────────────

  it('creates frame and SVG', () => {
    render(container, data)
    expect(container.querySelector('.bc-frame')).not.toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders correct number of bars (labels × series)', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-grouped')
    // 3 labels × 3 series = 9 bars
    expect(bars).toHaveLength(9)
  })

  it('renders bars as rect elements with bc-bar class', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-grouped')
    for (const bar of bars) {
      expect(bar.tagName.toLowerCase()).toBe('rect')
      expect(bar.classList.contains('bc-bar')).toBe(true)
    }
  })

  it('attaches data-series attribute to each bar', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-grouped')
    const indices = Array.from(bars).map(b => b.getAttribute('data-series'))
    expect(indices).toContain('Solar')
    expect(indices).toContain('Wind')
    expect(indices).toContain('Hydro')
  })

  // ── Grouping ─────────────────────────────────────────────────────

  it('bars in the same category group have different y positions', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-grouped')

    // Group bars by label using y0 position (approximate by proximity)
    // Bars from the same label cluster should differ in y
    const byLabel = new Map<string, number[]>()
    for (const bar of bars) {
      const si = bar.getAttribute('data-series') ?? '0'
      const y = parseFloat(bar.getAttribute('y') ?? '0')
      if (!byLabel.has(si)) {
        byLabel.set(si, [])
      }
      byLabel.get(si)!.push(y)
    }
    // Each series has 3 bars (one per label) at 3 distinct y positions
    for (const [, ys] of byLabel) {
      const unique = new Set(ys.map(y => Math.round(y)))
      expect(unique.size).toBe(3)
    }
  })

  it('bars in the same category have similar (grouped) x start position', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-grouped')
    // All bars start at x=0 (chart origin, left edge of value axis)
    for (const bar of bars) {
      const x = parseFloat(bar.getAttribute('x') ?? '-1')
      expect(x).toBeGreaterThanOrEqual(0)
    }
  })

  it('larger values produce wider bars within the same category', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-grouped')

    // Solar series (index 0): USA=200, China=680, Japan=90
    const solarBars = Array.from(bars).filter(b => b.getAttribute('data-series') === 'Solar')
    expect(solarBars).toHaveLength(3)

    const widths = solarBars.map(b => parseFloat(b.getAttribute('width') ?? '0'))
    expect(widths.every(w => w > 0)).toBe(true)

    // The widths should be distinct (200, 680, 90 → 3 distinct widths)
    const unique = new Set(widths.map(w => Math.round(w)))
    expect(unique.size).toBe(3)
  })

  // ── Colors ───────────────────────────────────────────────────────

  it('applies custom colors to each series', () => {
    render(container, data, { colors: ['#ff0000', '#00ff00', '#0000ff'] })
    const bars = container.querySelectorAll('.bc-bar-grouped')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    expect(fills).toContain('#ff0000')
    expect(fills).toContain('#00ff00')
    expect(fills).toContain('#0000ff')
  })

  it('applies color overrides per series', () => {
    render(container, data, {
      seriesOverrides: [{ name: 'Solar', color: '#123456' }],
    })
    const bars = container.querySelectorAll('.bc-bar-grouped')
    const solarBars = Array.from(bars).filter(b => b.getAttribute('data-series') === 'Solar')
    for (const bar of solarBars) {
      expect(bar.getAttribute('fill')).toBe('#123456')
    }
  })

  // ── Value labels ─────────────────────────────────────────────────

  it('renders value labels by default', () => {
    render(container, data)
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels.length).toBeGreaterThan(0)
  })

  it('does not render value labels when valueLabels=false', () => {
    render(container, data, { valueLabels: false })
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(0)
  })

  it('value label texts match data values', () => {
    render(container, data)
    const labels = container.querySelectorAll('.bc-value-label')
    const texts = Array.from(labels).map(l => l.textContent)
    expect(texts).toContain('200')
    expect(texts).toContain('680')
    expect(texts).toContain('90')
  })

  // ── Legend ───────────────────────────────────────────────────────

  it('renders legend by default', () => {
    render(container, data)
    expect(container.querySelector('.bc-legend')).not.toBeNull()
  })

  it('hides legend when legend=false', () => {
    render(container, data, { legend: false })
    expect(container.querySelector('.bc-legend')).toBeNull()
  })

  it('legend contains series names', () => {
    render(container, data)
    const legendText = container.querySelector('.bc-legend')?.textContent ?? ''
    expect(legendText).toContain('Solar')
    expect(legendText).toContain('Wind')
    expect(legendText).toContain('Hydro')
  })

  // ── Sort mode ────────────────────────────────────────────────────

  it('sortMode total orders category groups by descending total', () => {
    render(container, data, { sortMode: 'total' })
    const bars = container.querySelectorAll('.bc-bar-grouped')

    // Totals: USA=570, China=2060, Japan=220
    // Expected order: China, USA, Japan (descending)
    // Solar bars (series 0) should have: China widest, USA medium, Japan narrowest
    // Sort by y position (ascending y = higher on screen = first in sort)
    const solarBars = Array.from(bars)
      .filter(b => b.getAttribute('data-series') === 'Solar')
      .map(b => ({
        y: parseFloat(b.getAttribute('y') ?? '0'),
        w: parseFloat(b.getAttribute('width') ?? '0'),
      }))
      .sort((a, b) => a.y - b.y)

    // Top group (lowest y) should be the widest (highest total: China=680 Solar)
    expect(solarBars[0].w).toBeGreaterThan(solarBars[1].w)
    expect(solarBars[1].w).toBeGreaterThan(solarBars[2].w)
  })

  // ── Hidden series ────────────────────────────────────────────────

  it('hidden series are excluded from rendering', () => {
    render(container, data, {
      seriesOverrides: [{ name: 'Wind', hidden: true }],
    })
    const bars = container.querySelectorAll('.bc-bar-grouped')
    // 3 labels × 2 visible series = 6 bars
    expect(bars).toHaveLength(6)

    const indices = Array.from(bars).map(b => b.getAttribute('data-series'))
    // Wind is hidden, so its name should not appear on any bar
    expect(indices).not.toContain('Wind')
  })

  // ── Series opacity ───────────────────────────────────────────────

  it('applies opacity override', () => {
    render(container, data, {
      seriesOverrides: [{ name: 'Hydro', opacity: 0.4 }],
      valueLabels: false,
    })
    const bars = container.querySelectorAll('.bc-bar-grouped')
    const hydroBars = Array.from(bars).filter(b => b.getAttribute('data-series') === 'Hydro')
    for (const bar of hydroBars) {
      expect(bar.getAttribute('fill-opacity')).toBe('0.4')
    }
  })

  // ── categoryLabelLine ────────────────────────────────────────────

  it('renders category label text elements when categoryLabelLine=true', () => {
    render(container, data, { categoryLabelLine: true })
    const labels = container.querySelectorAll('.bc-category-label')
    expect(labels).toHaveLength(3)
    const texts = Array.from(labels).map(l => l.textContent)
    expect(texts).toContain('USA')
    expect(texts).toContain('China')
    expect(texts).toContain('Japan')
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

  it('category label texts are offset from each group top', () => {
    render(container, data, { categoryLabelLine: true })
    const labels = container.querySelectorAll('.bc-category-label')
    const ys = Array.from(labels).map(l => parseFloat(l.getAttribute('y') ?? '0'))
    // All y positions should be positive (inside chart area)
    expect(ys.every(y => y >= 0)).toBe(true)
    // And distinct (different groups)
    const unique = new Set(ys.map(y => Math.round(y)))
    expect(unique.size).toBe(3)
  })

  // ── Clip path ────────────────────────────────────────────────────

  it('reuses a single clipPath across repeated renders to the same container', () => {
    for (let i = 0; i < 5; i++) {
      render(container, data)
    }
    expect(container.querySelectorAll('clipPath')).toHaveLength(1)
  })

  // ── barBackground ──────────────────────────────────────────────

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

    it('works with categoryLabelLine', () => {
      render(container, data, { barBackground: true, categoryLabelLine: true })
      const bgs = container.querySelectorAll('.bc-bar-bg')
      expect(bgs).toHaveLength(3)
      const clipRect = container.querySelector('clipPath rect')!
      const chartWidth = Number(clipRect.getAttribute('width'))
      const widths = Array.from(bgs).map(b => Number(b.getAttribute('width')))
      expect(widths.every(w => w === chartWidth)).toBe(true)
    })
  })

  // ── barSeparators ──────────────────────────────────────────────

  describe('barSeparators', () => {
    it('renders separator lines when barSeparators is true', () => {
      render(container, data, { barSeparators: true })
      const seps = container.querySelectorAll('.bc-bar-separator')
      // 3 labels → 2 separators
      expect(seps).toHaveLength(2)
    })

    it('separator lines are horizontal', () => {
      render(container, data, { barSeparators: true })
      const seps = container.querySelectorAll('.bc-bar-separator')
      for (const sep of seps) {
        expect(sep.getAttribute('y1')).toBe(sep.getAttribute('y2'))
      }
    })

    it('separator lines span full chart width', () => {
      render(container, data, { barSeparators: true })
      const clipRect = container.querySelector('clipPath rect')!
      const chartWidth = Number(clipRect.getAttribute('width'))
      const seps = container.querySelectorAll('.bc-bar-separator')
      for (const sep of seps) {
        expect(Number(sep.getAttribute('x1'))).toBe(0)
        expect(Number(sep.getAttribute('x2'))).toBe(chartWidth)
      }
    })

    it('does not render separators when barSeparators is not set', () => {
      render(container, data)
      const seps = container.querySelectorAll('.bc-bar-separator')
      expect(seps).toHaveLength(0)
    })

    it('does not render separators for a single label', () => {
      const singleLabel = {
        labels: ['USA'],
        values: [],
        series: [{ name: 'Solar', values: [200] }],
      }
      render(container, singleLabel, { barSeparators: true })
      const seps = container.querySelectorAll('.bc-bar-separator')
      expect(seps).toHaveLength(0)
    })
  })

  // ── Frame options ────────────────────────────────────────────────

  it('renders title when provided', () => {
    render(container, data, { frame: { title: 'Renewable Energy' } })
    const title = container.querySelector('.bc-frame-title')
    expect(title?.textContent).toContain('Renewable Energy')
  })

  // ── Transition ───────────────────────────────────────────────────

  it('re-renders without error on transition', () => {
    render(container, data)
    expect(() => render(container, data, {}, true)).not.toThrow()
    const bars = container.querySelectorAll('.bc-bar-grouped')
    expect(bars).toHaveLength(9)
  })

  it('preserves bar elements for data-join on same chart type transition', () => {
    render(container, data)
    render(container, data, { colors: ['#aabbcc'] }, true)
    const bars = container.querySelectorAll('.bc-bar-grouped')
    expect(bars).toHaveLength(9)
  })

  // ── Single series ────────────────────────────────────────────────

  it('renders single series correctly', () => {
    const singleData = {
      labels: ['A', 'B', 'C'],
      values: [],
      series: [{ name: 'Value', values: [10, 30, 20] }],
    }
    render(container, singleData)
    const bars = container.querySelectorAll('.bc-bar-grouped')
    expect(bars).toHaveLength(3)
  })

  // ── Empty data guard ─────────────────────────────────────────────

  it('renders with no series without error', () => {
    const emptyData = { labels: ['A', 'B'], values: [], series: [] }
    expect(() => render(container, emptyData)).not.toThrow()
  })

  // ── Highlight / dimming ──────────────────────────────────────────

  it('dims non-highlighted series bars to 0.35', () => {
    render(container, data, { highlights: [{ target: 'Solar' }] })
    const bars = Array.from(container.querySelectorAll('.bc-bar-grouped'))
    const a = bars.find(b => b.getAttribute('data-series') === 'Solar')
    const other = bars.find(b => b.getAttribute('data-series') === 'Wind')
    expect(a?.getAttribute('opacity')).toBe('1')
    expect(other?.getAttribute('opacity')).toBe('0.35')
  })

  // ── Colorize ─────────────────────────────────────────────────────

  it('applies colorize to the targeted series', () => {
    render(container, data, { colorizes: [{ target: 'Solar', color: '#ff0000' }] })
    const bars = Array.from(container.querySelectorAll('.bc-bar-grouped'))
    const a = bars.find(b => b.getAttribute('data-series') === 'Solar')
    const other = bars.find(b => b.getAttribute('data-series') === 'Wind')
    expect(a?.getAttribute('fill')).toBe('#ff0000')
    expect(other?.getAttribute('fill')).not.toBe('#ff0000')
  })

  // ── categoryLabelLine on a dense chart (audit G3) ──

  describe('categoryLabelLine on a dense chart', () => {
    it('keeps every bar visible', () => {
      const labels = Array.from({ length: 19 }, (_, i) => `Category ${String(i + 1).padStart(2, '0')}`)
      render(container, {
        labels,
        values: [],
        series: [
          { name: 'S1', values: labels.map(() => 10) },
          { name: 'S2', values: labels.map(() => 20) },
        ],
      }, { categoryLabelLine: true })
      const heights = Array.from(container.querySelectorAll('.bc-bar')).map(r => Number(r.getAttribute('height')))
      expect(heights).toHaveLength(38)
      expect(heights.every(h => h > 0)).toBe(true)
    })
  })

  describe('overlays', () => {
    const overlayData = {
      labels: ['A', 'B'],
      values: [],
      series: [
        { name: 'Gold', values: [5, 8] },
        { name: 'Gold low', values: [4, 6] },
        { name: 'Gold high', values: [7, 9] },
        { name: 'Silver', values: [3, 4] },
      ],
    }
    const range = [{ columns: ['Gold low', 'Gold high'], bar: 'Gold' }]

    function rangeRects(): Element[] {
      return Array.from(container.querySelectorAll('rect.bc-overlay-range'))
    }

    function goldBars(): Element[] {
      return Array.from(container.querySelectorAll('.bc-bar[data-series="Gold"]'))
    }

    it('draws a range at the slot of its bar series', () => {
      render(container, overlayData, { overlays: range })
      const rects = rangeRects()
      const bars = goldBars()
      expect(rects).toHaveLength(2)
      rects.forEach((rect, i) => {
        expect(rect.getAttribute('y')).toBe(bars[i].getAttribute('y'))
        expect(rect.getAttribute('height')).toBe(bars[i].getAttribute('height'))
      })
    })

    it('does not draw the overlay columns as bars', () => {
      render(container, overlayData, { overlays: range })
      expect(container.querySelector('.bc-bar[data-series="Gold low"]')).toBeNull()
      expect(container.querySelector('.bc-bar[data-series="Gold high"]')).toBeNull()
    })

    it('grows the value axis to include the overlay', () => {
      const tall = { ...overlayData, series: overlayData.series.map(s => s.name === 'Gold high' ? { ...s, values: [40, 40] } : s) }
      render(container, tall, { overlays: range })
      const rect = rangeRects()[0]
      const start = Number(rect.getAttribute('x'))
      const end = start + Number(rect.getAttribute('width'))
      const plotWidth = Number(container.querySelector('clipPath rect')!.getAttribute('width'))
      expect(end).toBeLessThanOrEqual(plotWidth + 0.001)
    })

    it('draws nothing when the target series is hidden', () => {
      const hidden = [{ name: 'Gold', hidden: true }]
      expect(() => render(container, overlayData, { overlays: range, seriesOverrides: hidden })).not.toThrow()
      expect(rangeRects()).toHaveLength(0)
    })

    it('reuses the range element across scenes', () => {
      render(container, overlayData, { overlays: range })
      const before = rangeRects()[0]
      const moved = { ...overlayData, series: overlayData.series.map(s => s.name === 'Gold high' ? { ...s, values: [9, 9] } : s) }
      render(container, moved, { overlays: range }, true)
      expect(rangeRects()[0]).toBe(before)
    })

    it('adds the overlay to the tooltip', () => {
      render(container, overlayData, { tooltips: true, overlays: [{ columns: ['Gold low', 'Gold high'], bar: 'Gold', title: 'Gold low to Gold high' }] })
      const bar = container.querySelector('.bc-bar')!
      bar.dispatchEvent(new MouseEvent('mouseenter'))
      const tooltip = document.querySelector('.bc-tooltip')
      expect(tooltip?.textContent).toContain('Gold low to Gold high: 4 to 7')
      tooltip?.remove()
      document.getElementById('bc-tooltip-styles')?.remove()
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
        { name: 'Gold', values: [5, 8] },
        { name: 'Gold low', values: [4, 6] },
        { name: 'Gold high', values: [7, 9] },
        { name: 'Silver', values: [3, 4] },
      ],
    }
    const keyRange = [{ columns: ['Gold low', 'Gold high'], bar: 'Gold' }]

    it('lists the range after the series when direct labelling is off', () => {
      render(container, keyData, { overlays: keyRange, directLabelling: false })
      expect(legendTexts()).toEqual(['Gold', 'Silver', 'Gold low to Gold high'])
    })

    it('labels the range directly and keeps it out of the key', () => {
      render(container, keyData, { overlays: keyRange, directLabelling: true })
      const label = container.querySelector('.bc-overlay-label')!
      expect(label.textContent).toBe('Gold low to Gold high')
      expect(legendTexts()).toEqual(['Gold', 'Silver'])
    })

    it('hides the key with legend false', () => {
      render(container, keyData, { overlays: keyRange, legend: false })
      expect(container.querySelectorAll('.bc-legend-item')).toHaveLength(0)
    })
  })

  describe('overlay cues', () => {
    const cueData = {
      labels: ['A', 'B'],
      values: [],
      series: [
        { name: 'Gold', values: [5, 8] },
        { name: 'Gold low', values: [4, 6] },
        { name: 'Gold high', values: [7, 9] },
        { name: 'Silver', values: [3, 4] },
        { name: 'T', values: [4, 9] },
      ],
    }
    const mute = [{ columns: ['Gold low', 'Gold high'], bar: 'Gold', muteIfCrosses: 5 }]
    const target = [{ columns: ['T'], bar: 'Gold', aboveColor: '#00ff00' }]

    function seriesBars(name: string): Element[] {
      return Array.from(container.querySelectorAll(`.bc-bar[data-series="${name}"]`))
    }

    it('fades only the crossing bar of the target series', () => {
      render(container, cueData, { overlays: mute })
      const [a, b] = seriesBars('Gold')
      expect(a.getAttribute('opacity')).toBe('0.45')
      expect(b.getAttribute('opacity')).toBeNull()
      seriesBars('Silver').forEach(bar => expect(bar.getAttribute('opacity')).toBeNull())
    })

    it('brings the bar back to full opacity when a scene drops the cue', () => {
      render(container, cueData, { overlays: mute })
      render(container, cueData, { overlays: [{ columns: ['Gold low', 'Gold high'], bar: 'Gold' }] }, true)
      const [a] = seriesBars('Gold')
      expect(a.getAttribute('opacity')).toBeNull()
    })

    it('colors only the target series bar that reaches the marker', () => {
      render(container, cueData, { overlays: target })
      const [a, b] = seriesBars('Gold')
      expect(a.getAttribute('fill')).toBe('#00ff00')
      expect(b.getAttribute('fill')).not.toBe('#00ff00')
      seriesBars('Silver').forEach(bar => expect(bar.getAttribute('fill')).not.toBe('#00ff00'))
    })

    it('lets colorize win over the target color', () => {
      render(container, cueData, { overlays: target, colorizes: [{ target: 'Gold', color: '#0000ff' }] })
      const [a] = seriesBars('Gold')
      expect(a.getAttribute('fill')).toBe('#0000ff')
    })

    it('keeps the series color in the legend swatch', () => {
      render(container, cueData, { overlays: target })
      const swatch = container.querySelector('.bc-legend-item[data-series="Gold"] rect, .bc-legend-item[data-series="Gold"] circle')
      const [, b] = seriesBars('Gold')
      expect(swatch?.getAttribute('fill')).toBe(b.getAttribute('fill'))
    })
  })
})
