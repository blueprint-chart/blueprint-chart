import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './bar-stacked'
import { StackMode } from '../../../enums'

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

  it('renders bars with correct data-series attribute', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar-stacked')
    const seriesIndices = Array.from(bars).map(b => b.getAttribute('data-series'))
    expect(seriesIndices).toContain('0')
    expect(seriesIndices).toContain('1')
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
    const bars = container.querySelectorAll('.bc-bar-stacked')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    for (const fill of fills) {
      expect(fill).toBeTruthy()
    }
    const series0Fills = Array.from(bars)
      .filter(b => b.getAttribute('data-series') === '0')
      .map(b => b.getAttribute('fill'))
    for (const fill of series0Fills) {
      expect(fill).toBe('#4e79a7')
    }
  })

  // ── Value labels ─────────────────────────────────────────────────

  it('renders value labels when valueLabels is true', () => {
    render(container, data, { valueLabels: true })
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(4)
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
    const series0Bars = Array.from(bars).filter(b => b.getAttribute('data-series') === '0')
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

  it('applies opacity override to series', () => {
    render(container, data, {
      seriesOverrides: [{ name: 'Product A', opacity: 0.5 }],
    })
    const bars = container.querySelectorAll('.bc-bar-stacked')
    const series0Bars = Array.from(bars).filter(b => b.getAttribute('data-series') === '0')
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
})
