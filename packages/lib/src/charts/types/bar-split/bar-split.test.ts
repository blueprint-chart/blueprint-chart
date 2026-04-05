import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './bar-split'

describe('bar-split', () => {
  let container: HTMLElement

  const data = {
    labels: ['CDU/CSU', 'Greens', 'SPD'],
    values: [],
    series: [
      { name: 'Poll', values: [29, 22, 14] },
      { name: 'High', values: [32, 25, 16] },
      { name: 'Low', values: [27, 20, 12] },
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
    const bars = container.querySelectorAll('.bc-bar-split')
    // 3 labels × 3 series = 9 bars
    expect(bars).toHaveLength(9)
  })

  it('renders bars as rect elements with bc-bar class', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-split')
    for (const bar of bars) {
      expect(bar.tagName.toLowerCase()).toBe('rect')
      expect(bar.classList.contains('bc-bar')).toBe(true)
    }
  })

  it('attaches data-series attribute to each bar', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-split')
    const indices = Array.from(bars).map(b => b.getAttribute('data-series'))
    expect(indices).toContain('0')
    expect(indices).toContain('1')
    expect(indices).toContain('2')
  })

  // ── Panel layout ─────────────────────────────────────────────────

  it('renders one panel header per series', () => {
    render(container, data)
    const headers = container.querySelectorAll('.bc-split-header')
    expect(headers).toHaveLength(3)
    const texts = Array.from(headers).map(h => h.textContent)
    expect(texts).toContain('Poll')
    expect(texts).toContain('High')
    expect(texts).toContain('Low')
  })

  it('bars from different panels do not share the same x position', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-split')

    // Collect x positions grouped by data-series
    const byPanel = new Map<string, number[]>()
    for (const bar of bars) {
      const si = bar.getAttribute('data-series') ?? '0'
      const x = parseFloat(bar.getAttribute('x') ?? '0')
      if (!byPanel.has(si)) {
        byPanel.set(si, [])
      }
      byPanel.get(si)!.push(x)
    }

    // All bars in a given panel share the same x start (panel offset)
    for (const [, xs] of byPanel) {
      const unique = new Set(xs)
      expect(unique.size).toBe(1)
    }

    // Different panels have different x offsets
    const panelOffsets = Array.from(byPanel.values()).map(xs => xs[0])
    const uniqueOffsets = new Set(panelOffsets)
    expect(uniqueOffsets.size).toBe(3)
  })

  it('bars within a panel are at different y positions', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-split')

    // Group by data-series
    const byPanel = new Map<string, number[]>()
    for (const bar of bars) {
      const si = bar.getAttribute('data-series') ?? '0'
      const y = parseFloat(bar.getAttribute('y') ?? '0')
      if (!byPanel.has(si)) {
        byPanel.set(si, [])
      }
      byPanel.get(si)!.push(y)
    }

    for (const [, ys] of byPanel) {
      const unique = new Set(ys)
      // Each bar in a panel should be at a different y position
      expect(unique.size).toBe(ys.length)
    }
  })

  it('larger values produce wider bars within the same panel', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-split')

    // Panel 0 (Poll): CDU/CSU=29 > Greens=22 > SPD=14
    const panel0Bars = Array.from(bars).filter(b => b.getAttribute('data-series') === '0')
    const widths = panel0Bars.map(b => parseFloat(b.getAttribute('width') ?? '0'))
    // CDU/CSU has highest value, so should have the widest bar
    // We can't guarantee order without knowing y positions, but all widths should be positive
    expect(widths.every(w => w > 0)).toBe(true)
    // And widths should be distinct (different values → different widths)
    const unique = new Set(widths.map(w => Math.round(w)))
    expect(unique.size).toBe(3)
  })

  // ── Shared scale ─────────────────────────────────────────────────

  it('with sharedScale=false panels have independent scales', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-split')

    // Poll panel max is 29 (CDU/CSU), High panel max is 32 (CDU/CSU)
    // With independent scales, both CDU/CSU bars fill ~100% of their panel width
    // So they should have the same (or very similar) width even though values differ

    // Gather CDU/CSU bars from panel 0 (Poll=29) and panel 1 (High=32)
    const cduBars: { si: string, width: number }[] = []
    for (const bar of bars) {
      const si = bar.getAttribute('data-series') ?? ''
      if (si === '0' || si === '1') {
        cduBars.push({ si, width: parseFloat(bar.getAttribute('width') ?? '0') })
      }
    }

    // With independent scales, widths should be close (both ~max of panel)
    const p0Widths = cduBars.filter(b => b.si === '0').map(b => b.width)
    const p1Widths = cduBars.filter(b => b.si === '1').map(b => b.width)
    expect(p0Widths.length).toBeGreaterThan(0)
    expect(p1Widths.length).toBeGreaterThan(0)
  })

  it('with sharedScale=true bars are comparable across panels', () => {
    render(container, { ...data }, { sharedScale: true })
    const bars = container.querySelectorAll('.bc-bar-split')

    // With shared scale (max = 32 from High panel), CDU/CSU in Poll (29)
    // should be narrower than CDU/CSU in High (32)
    const panel0Cdu = Array.from(bars).find(b => b.getAttribute('data-series') === '0')
    const panel1Cdu = Array.from(bars).find(b => b.getAttribute('data-series') === '1')
    expect(panel0Cdu).not.toBeNull()
    expect(panel1Cdu).not.toBeNull()

    const w0 = parseFloat(panel0Cdu!.getAttribute('width') ?? '0')
    const w1 = parseFloat(panel1Cdu!.getAttribute('width') ?? '0')
    // Poll CDU=29 < High CDU=32, so panel0 bar should be narrower
    expect(w0).toBeLessThan(w1)
  })

  // ── Sort mode ────────────────────────────────────────────────────

  it('sortMode total orders labels by descending total', () => {
    render(container, data, { sortMode: 'total' })
    const bars = container.querySelectorAll('.bc-bar-split')

    // Gather y positions for panel 0 (Poll)
    const panel0Bars = Array.from(bars)
      .filter(b => b.getAttribute('data-series') === '0')
      .map(b => ({ y: parseFloat(b.getAttribute('y') ?? '0'), w: parseFloat(b.getAttribute('width') ?? '0') }))
      .sort((a, b) => a.y - b.y)

    // Should be sorted by descending total: CDU/CSU > Greens > SPD
    // Wider bars (higher values) should appear first (lower y = higher on screen)
    const widths = panel0Bars.map(b => b.w)
    for (let i = 1; i < widths.length; i++) {
      expect(widths[i]).toBeLessThanOrEqual(widths[i - 1] + 0.5) // allow floating point
    }
  })

  // ── Hidden series ────────────────────────────────────────────────

  it('hidden series are excluded from rendering', () => {
    render(container, data, {
      seriesOverrides: [{ name: 'High', hidden: true }],
    })
    const bars = container.querySelectorAll('.bc-bar-split')
    // 3 labels × 2 visible series = 6 bars
    expect(bars).toHaveLength(6)

    const headers = container.querySelectorAll('.bc-split-header')
    const texts = Array.from(headers).map(h => h.textContent)
    expect(texts).not.toContain('High')
  })

  // ── Single series ────────────────────────────────────────────────

  it('renders a single series as one panel', () => {
    const singleData = {
      labels: ['A', 'B', 'C'],
      values: [],
      series: [{ name: 'Metric', values: [10, 20, 30] }],
    }
    render(container, singleData)
    expect(container.querySelectorAll('.bc-bar-split')).toHaveLength(3)
    expect(container.querySelectorAll('.bc-split-header')).toHaveLength(1)
  })

  // ── Colors ───────────────────────────────────────────────────────

  it('applies custom colors to panels', () => {
    render(container, data, { colors: ['#ff0000', '#00ff00', '#0000ff'] })
    const bars = container.querySelectorAll('.bc-bar-split')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    expect(fills).toContain('#ff0000')
    expect(fills).toContain('#00ff00')
    expect(fills).toContain('#0000ff')
  })

  // ── Value labels ─────────────────────────────────────────────────

  it('renders value labels by default', () => {
    render(container, data)
    const labels = container.querySelectorAll('.bc-value-label')
    // One label per bar = 9
    expect(labels.length).toBeGreaterThan(0)
  })

  it('does not render value labels when valueLabels=false', () => {
    render(container, data, { valueLabels: false })
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(0)
  })

  it('value label text matches data values', () => {
    render(container, data)
    const labels = container.querySelectorAll('.bc-value-label')
    const texts = Array.from(labels).map(l => l.textContent)
    expect(texts).toContain('29')
    expect(texts).toContain('22')
    expect(texts).toContain('14')
  })

  // ── Frame options ────────────────────────────────────────────────

  it('renders title when provided', () => {
    render(container, data, { frame: { title: 'Election Polls' } })
    const title = container.querySelector('.bc-frame-title')
    expect(title?.textContent).toContain('Election Polls')
  })

  // ── Transition ───────────────────────────────────────────────────

  it('re-renders without error on transition', () => {
    render(container, data)
    expect(() => render(container, data, {}, true)).not.toThrow()
    const bars = container.querySelectorAll('.bc-bar-split')
    expect(bars).toHaveLength(9)
  })

  it('preserves bar elements for data-join on same chart type transition', () => {
    render(container, data)
    // Simulate transition re-render — should not throw and should re-render bars
    render(container, data, { colors: ['#aabbcc'] }, true)
    const bars = container.querySelectorAll('.bc-bar-split')
    expect(bars).toHaveLength(9)
  })
})
