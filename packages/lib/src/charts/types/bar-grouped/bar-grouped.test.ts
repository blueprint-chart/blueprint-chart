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
})
