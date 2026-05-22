import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './area'

describe('area chart', () => {
  let container: HTMLElement

  const data = {
    labels: ['Jan', 'Feb', 'Mar'],
    values: [10, 25, 15],
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

  it('renders an area path', () => {
    render(container, data)
    const area = container.querySelector('.bc-area')
    expect(area).not.toBeNull()
    expect(area?.getAttribute('d')).toBeTruthy()
  })

  it('renders a line path on top of the area', () => {
    render(container, data)
    const line = container.querySelector('.bc-line')
    expect(line).not.toBeNull()
    expect(line?.getAttribute('d')).toBeTruthy()
  })

  it('renders dots for each data point', () => {
    render(container, data)
    const dots = container.querySelectorAll('.bc-dot')
    expect(dots).toHaveLength(3)
  })

  it('creates frame and SVG', () => {
    render(container, data)
    expect(container.querySelector('.bc-frame')).not.toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders a clip path to constrain chart content', () => {
    render(container, data)
    const clipPath = container.querySelector('clipPath')
    expect(clipPath).not.toBeNull()
    const clipped = container.querySelector(`[clip-path="url(#${clipPath!.id})"]`)
    expect(clipped).not.toBeNull()
    expect(clipped!.querySelector('.bc-area')).not.toBeNull()
    expect(clipped!.querySelector('.bc-line')).not.toBeNull()
  })

  // ── Area fill always on ───────────────────────────────────────────

  it('always renders an area path (area fill is on by default)', () => {
    render(container, data)
    const area = container.querySelector('.bc-area')
    expect(area).not.toBeNull()
  })

  it('area has default opacity of 0.25', () => {
    render(container, data)
    const area = container.querySelector('.bc-area')
    expect(area?.getAttribute('opacity')).toBe('0.25')
  })

  it('area uses custom areaFillOpacity', () => {
    render(container, data, { areaFillOpacity: 0.6 })
    const area = container.querySelector('.bc-area')
    expect(area?.getAttribute('opacity')).toBe('0.6')
  })

  // ── Colors ───────────────────────────────────────────────────────

  it('uses default color for area fill and line stroke', () => {
    render(container, data)
    const area = container.querySelector('.bc-area')
    const line = container.querySelector('.bc-line')
    expect(area?.getAttribute('fill')).toBe('#4e79a7')
    expect(line?.getAttribute('stroke')).toBe('#4e79a7')
  })

  it('applies custom color to both area and line', () => {
    render(container, data, { colors: ['#ff0000'] })
    const area = container.querySelector('.bc-area')
    const line = container.querySelector('.bc-line')
    expect(area?.getAttribute('fill')).toBe('#ff0000')
    expect(line?.getAttribute('stroke')).toBe('#ff0000')
  })

  it('line path has fill=none', () => {
    render(container, data)
    const line = container.querySelector('.bc-line')
    expect(line?.getAttribute('fill')).toBe('none')
  })

  it('line path has stroke-width=2', () => {
    render(container, data)
    const line = container.querySelector('.bc-line')
    expect(line?.getAttribute('stroke-width')).toBe('2')
  })

  // ── Interpolation ────────────────────────────────────────────────

  it('uses monotoneX curve by default (different from linear)', () => {
    render(container, data)
    const defaultD = container.querySelector('.bc-line')?.getAttribute('d')

    const container2 = document.createElement('div')
    document.body.appendChild(container2)
    render(container2, data, { interpolation: 'linear' })
    const linearD = container2.querySelector('.bc-line')?.getAttribute('d')

    expect(defaultD).toBeTruthy()
    expect(defaultD).not.toBe(linearD)
  })

  it('respects interpolation option on area path', () => {
    const container2 = document.createElement('div')
    document.body.appendChild(container2)
    render(container, data, { interpolation: 'linear' })
    render(container2, data, { interpolation: 'step' })

    const areaLinear = container.querySelector('.bc-area')?.getAttribute('d')
    const areaStep = container2.querySelector('.bc-area')?.getAttribute('d')
    expect(areaLinear).not.toBe(areaStep)
  })

  // ── Value labels ─────────────────────────────────────────────────

  it('does not render value labels by default', () => {
    render(container, data)
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(0)
  })

  it('renders value labels when valueLabels=true', () => {
    render(container, data, { valueLabels: true })
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(3)
  })

  it('value labels contain the data values', () => {
    render(container, data, { valueLabels: true })
    const labels = Array.from(container.querySelectorAll('.bc-value-label'))
    const texts = labels.map(l => l.textContent)
    expect(texts).toContain('10')
    expect(texts).toContain('25')
    expect(texts).toContain('15')
  })

  // ── Tooltips / crosshair ─────────────────────────────────────────

  it('creates proximity overlay when tooltips=true', () => {
    render(container, data, { tooltips: true })
    expect(container.querySelector('.bc-proximity-overlay')).not.toBeNull()
  })

  it('creates crosshair lines when crosshair=true', () => {
    render(container, data, { crosshair: true })
    const crosshairs = container.querySelectorAll('.bc-crosshair')
    expect(crosshairs.length).toBeGreaterThan(0)
  })

  it('does not create proximity overlay by default', () => {
    render(container, data)
    expect(container.querySelector('.bc-proximity-overlay')).toBeNull()
  })

  // ── Line symbols ─────────────────────────────────────────────────

  it('does not render symbols by default', () => {
    render(container, data)
    expect(container.querySelector('.bc-symbol')).toBeNull()
  })

  it('renders symbols when lineSymbols is configured', () => {
    render(container, data, { lineSymbols: { symbol: 'circle', showOn: 'all' } })
    const symbols = container.querySelectorAll('.bc-symbol')
    expect(symbols).toHaveLength(3)
  })

  // ── Transitions ──────────────────────────────────────────────────

  it('supports transition parameter on second render', () => {
    render(container, data)
    render(container, { labels: ['A', 'B'], values: [15, 25] }, {}, true)
    expect(container.querySelector('.bc-area')).not.toBeNull()
    expect(container.querySelector('.bc-line')).not.toBeNull()
  })

  it('re-renders with new data preserving structure', () => {
    render(container, data)
    render(container, { labels: ['X', 'Y', 'Z', 'W'], values: [5, 10, 15, 20] }, {}, true)
    const dots = container.querySelectorAll('.bc-dot')
    expect(dots).toHaveLength(4)
  })

  it('transitions preserve area and line paths', () => {
    render(container, data)
    render(container, data, { colors: ['#00ff00'] }, true)
    const area = container.querySelector('.bc-area')
    const line = container.querySelector('.bc-line')
    expect(area).not.toBeNull()
    expect(area?.getAttribute('d')).toBeTruthy()
    expect(line).not.toBeNull()
    expect(line?.getAttribute('d')).toBeTruthy()
  })

  it('caches chart type as area for transition', () => {
    render(container, data)
    render(container, data, {}, true)
    // Same-type transition preserves single area and line
    const areas = container.querySelectorAll('.bc-area')
    expect(areas).toHaveLength(1)
  })

  // ── Edge cases ───────────────────────────────────────────────────

  it('handles single data point', () => {
    render(container, { labels: ['A'], values: [10] })
    expect(container.querySelector('.bc-area')).not.toBeNull()
    expect(container.querySelector('.bc-line')).not.toBeNull()
    expect(container.querySelectorAll('.bc-dot')).toHaveLength(1)
  })

  it('handles zero values', () => {
    render(container, { labels: ['A', 'B', 'C'], values: [0, 0, 0] })
    expect(container.querySelector('.bc-area')?.getAttribute('d')).toBeTruthy()
    expect(container.querySelector('.bc-line')?.getAttribute('d')).toBeTruthy()
  })

  it('handles negative values', () => {
    render(container, { labels: ['A', 'B', 'C'], values: [-10, 5, -3] })
    expect(container.querySelector('.bc-area')?.getAttribute('d')).toBeTruthy()
    expect(container.querySelector('.bc-line')?.getAttribute('d')).toBeTruthy()
  })

  // ── Frame options ────────────────────────────────────────────────

  it('renders frame title', () => {
    render(container, data, { frame: { title: 'Revenue' } })
    const title = container.querySelector('.bc-frame-title')
    expect(title).not.toBeNull()
    expect(title?.textContent).toBe('Revenue')
  })

  // ── Combined options ─────────────────────────────────────────────

  it('renders area + value labels + crosshair together', () => {
    render(container, data, { valueLabels: true, crosshair: true })
    expect(container.querySelector('.bc-area')).not.toBeNull()
    expect(container.querySelectorAll('.bc-value-label')).toHaveLength(3)
    expect(container.querySelector('.bc-crosshair')).not.toBeNull()
  })

  it('dots are invisible by default (fill-opacity 0)', () => {
    render(container, data)
    const dots = container.querySelectorAll('.bc-dot')
    dots.forEach((dot) => {
      expect(dot.getAttribute('fill-opacity')).toBe('0')
      expect(dot.getAttribute('stroke-opacity')).toBe('0')
    })
  })

  // ── Lifecycle: proximity tooltip + clipPath de-duplication ──────

  describe('lifecycle', () => {
    beforeEach(() => {
      // Earlier tests don't tidy up body-level tooltips; clear them so the
      // assertions below measure only what this test produces.
      document.querySelectorAll('.bc-tooltip').forEach(el => el.remove())
    })

    it('keeps a single body-level tooltip across 5 renders against the same container', () => {
      for (let i = 0; i < 5; i++) {
        render(container, data, { tooltips: true })
      }
      expect(document.querySelectorAll('.bc-tooltip')).toHaveLength(1)
    })

    it('keeps a single clipPath in <defs> across 5 renders against the same container', () => {
      for (let i = 0; i < 5; i++) {
        render(container, data, { tooltips: true })
      }
      const svg = container.querySelector('svg')!
      expect(svg.querySelectorAll('defs > clipPath')).toHaveLength(1)
    })
  })
})
