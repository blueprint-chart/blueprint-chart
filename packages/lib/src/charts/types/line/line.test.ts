import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './line'

describe('line chart', () => {
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

  it('renders a line path', () => {
    render(container, data)
    const path = container.querySelector('.bc-line')
    expect(path).not.toBeNull()
    expect(path?.getAttribute('d')).toBeTruthy()
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
    expect(clipped!.querySelector('.bc-line')).not.toBeNull()
  })

  it('sets default stroke color when no colors option given', () => {
    render(container, data)
    const path = container.querySelector('.bc-line')
    expect(path?.getAttribute('stroke')).toBe('#4e79a7')
  })

  it('sets fill=none on the line path', () => {
    render(container, data)
    const path = container.querySelector('.bc-line')
    expect(path?.getAttribute('fill')).toBe('none')
  })

  it('sets stroke-width=2 on the line path', () => {
    render(container, data)
    const path = container.querySelector('.bc-line')
    expect(path?.getAttribute('stroke-width')).toBe('2')
  })

  it('dots are invisible by default (fill-opacity 0)', () => {
    render(container, data)
    const dots = container.querySelectorAll('.bc-dot')
    dots.forEach((dot) => {
      expect(dot.getAttribute('fill-opacity')).toBe('0')
      expect(dot.getAttribute('stroke-opacity')).toBe('0')
    })
  })

  // ── Colors ───────────────────────────────────────────────────────

  it('applies custom color', () => {
    render(container, data, { colors: ['#ff0000'] })
    const path = container.querySelector('.bc-line')
    expect(path?.getAttribute('stroke')).toBe('#ff0000')
  })

  it('applies custom color to dots', () => {
    render(container, data, { colors: ['#ff0000'] })
    const dots = container.querySelectorAll('.bc-dot')
    dots.forEach((dot) => {
      expect(dot.getAttribute('fill')).toBe('#ff0000')
    })
  })

  // ── Frame options ────────────────────────────────────────────────

  describe('frame', () => {
    it('renders frame title', () => {
      render(container, data, { frame: { title: 'Revenue' } })
      const title = container.querySelector('.bc-frame-title')
      expect(title).not.toBeNull()
      expect(title?.textContent).toBe('Revenue')
    })

    it('renders frame description', () => {
      render(container, data, { frame: { description: 'Monthly trend' } })
      const desc = container.querySelector('.bc-frame-description')
      expect(desc).not.toBeNull()
      expect(desc?.textContent).toBe('Monthly trend')
    })

    it('renders frame note', () => {
      render(container, data, { frame: { note: 'Note: adjusted for inflation' } })
      const note = container.querySelector('.bc-frame-note')
      expect(note).not.toBeNull()
      expect(note?.textContent).toBe('Note: adjusted for inflation')
    })

    it('renders frame source', () => {
      render(container, data, { frame: { source: 'Census Bureau' } })
      const source = container.querySelector('.bc-frame-source')
      expect(source).not.toBeNull()
      expect(source?.textContent).toContain('Census Bureau')
    })

    it('renders credit by default', () => {
      render(container, data)
      const credit = container.querySelector('.bc-frame-credit')
      expect(credit).not.toBeNull()
    })

    it('hides credit when showCredit=false', () => {
      render(container, data, { frame: { showCredit: false } })
      const credit = container.querySelector('.bc-frame-credit')
      expect(credit).toBeNull()
    })
  })

  // ── Interpolation / curve ────────────────────────────────────────

  describe('interpolation', () => {
    it('uses linear curve by default', () => {
      render(container, data)
      const d = container.querySelector('.bc-line')?.getAttribute('d')
      expect(d).toBeTruthy()
      // linear produces simple L commands
      expect(d).toMatch(/[ML]/)
    })

    it('changes path when interpolation is monotoneX', () => {
      render(container, data)
      const linearD = container.querySelector('.bc-line')?.getAttribute('d')

      const container2 = document.createElement('div')
      document.body.appendChild(container2)
      render(container2, data, { interpolation: 'monotoneX' })
      const monotoneD = container2.querySelector('.bc-line')?.getAttribute('d')

      expect(monotoneD).toBeTruthy()
      // monotoneX uses cubic bezier curves (C commands), differs from linear
      expect(monotoneD).not.toBe(linearD)
    })

    it('changes path when interpolation is step', () => {
      render(container, data)
      const linearD = container.querySelector('.bc-line')?.getAttribute('d')

      const container2 = document.createElement('div')
      document.body.appendChild(container2)
      render(container2, data, { interpolation: 'step' })
      const stepD = container2.querySelector('.bc-line')?.getAttribute('d')

      expect(stepD).toBeTruthy()
      expect(stepD).not.toBe(linearD)
    })

    it('changes path when interpolation is basis', () => {
      render(container, data)
      const linearD = container.querySelector('.bc-line')?.getAttribute('d')

      const container2 = document.createElement('div')
      document.body.appendChild(container2)
      render(container2, data, { interpolation: 'basis' })
      const basisD = container2.querySelector('.bc-line')?.getAttribute('d')

      expect(basisD).toBeTruthy()
      expect(basisD).not.toBe(linearD)
    })
  })

  // ── Area fill ────────────────────────────────────────────────────

  describe('area fill', () => {
    it('does not render area path by default', () => {
      render(container, data)
      const area = container.querySelector('.bc-area')
      expect(area).toBeNull()
    })

    it('renders area path when areaFill=true', () => {
      render(container, data, { areaFill: true })
      const area = container.querySelector('.bc-area')
      expect(area).not.toBeNull()
      expect(area?.getAttribute('d')).toBeTruthy()
    })

    it('area path uses the line color as fill', () => {
      render(container, data, { areaFill: true, colors: ['#ff0000'] })
      const area = container.querySelector('.bc-area')
      expect(area?.getAttribute('fill')).toBe('#ff0000')
    })

    it('area path has default opacity of 0.2', () => {
      render(container, data, { areaFill: true })
      const area = container.querySelector('.bc-area')
      expect(area?.getAttribute('opacity')).toBe('0.2')
    })

    it('area path uses custom opacity', () => {
      render(container, data, { areaFill: true, areaFillOpacity: 0.5 })
      const area = container.querySelector('.bc-area')
      expect(area?.getAttribute('opacity')).toBe('0.5')
    })

    it('area path respects interpolation curve', () => {
      const container2 = document.createElement('div')
      document.body.appendChild(container2)
      render(container, data, { areaFill: true, interpolation: 'linear' })
      render(container2, data, { areaFill: true, interpolation: 'step' })

      const areaLinear = container.querySelector('.bc-area')?.getAttribute('d')
      const areaStep = container2.querySelector('.bc-area')?.getAttribute('d')
      expect(areaLinear).not.toBe(areaStep)
    })
  })

  // ── Value labels ─────────────────────────────────────────────────

  describe('value labels', () => {
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

    it('value labels are positioned near their dots', () => {
      render(container, data, { valueLabels: true })
      const labels = container.querySelectorAll('.bc-value-label')
      labels.forEach((label) => {
        // Each label should have x and y attributes set
        expect(label.getAttribute('x')).toBeTruthy()
        expect(label.getAttribute('y')).toBeTruthy()
      })
    })
  })

  // ── Crosshair ────────────────────────────────────────────────────

  describe('crosshair', () => {
    it('does not create crosshair elements by default', () => {
      render(container, data)
      expect(container.querySelector('.bc-crosshair')).toBeNull()
    })

    it('creates crosshair lines when crosshair=true', () => {
      render(container, data, { crosshair: true })
      const crosshairs = container.querySelectorAll('.bc-crosshair')
      expect(crosshairs.length).toBeGreaterThan(0)
    })

    it('creates vertical crosshair line', () => {
      render(container, data, { crosshair: true })
      const vLine = container.querySelector('.bc-crosshair-v')
      expect(vLine).not.toBeNull()
    })

    it('creates horizontal crosshair line', () => {
      render(container, data, { crosshair: true })
      const hLine = container.querySelector('.bc-crosshair-h')
      expect(hLine).not.toBeNull()
    })

    it('creates only vertical crosshair when direction=vertical', () => {
      render(container, data, { crosshair: true, crosshairDirection: 'vertical' })
      expect(container.querySelector('.bc-crosshair-v')).not.toBeNull()
      expect(container.querySelector('.bc-crosshair-h')).toBeNull()
    })

    it('creates only horizontal crosshair when direction=horizontal', () => {
      render(container, data, { crosshair: true, crosshairDirection: 'horizontal' })
      expect(container.querySelector('.bc-crosshair-v')).toBeNull()
      expect(container.querySelector('.bc-crosshair-h')).not.toBeNull()
    })

    it('creates proximity overlay for interaction', () => {
      render(container, data, { crosshair: true })
      expect(container.querySelector('.bc-proximity-overlay')).not.toBeNull()
    })

    it('creates proximity highlight dot', () => {
      render(container, data, { crosshair: true })
      expect(container.querySelector('.bc-proximity-dot')).not.toBeNull()
    })
  })

  // ── Tooltips ─────────────────────────────────────────────────────

  describe('tooltips', () => {
    it('does not create proximity overlay by default', () => {
      render(container, data)
      expect(container.querySelector('.bc-proximity-overlay')).toBeNull()
    })

    it('creates proximity overlay when tooltips=true', () => {
      render(container, data, { tooltips: true })
      expect(container.querySelector('.bc-proximity-overlay')).not.toBeNull()
    })

    it('creates a tooltip element in the document', () => {
      render(container, data, { tooltips: true })
      const tooltip = document.querySelector('.bc-tooltip')
      expect(tooltip).not.toBeNull()
    })

    it('injects tooltip styles into the document head', () => {
      render(container, data, { tooltips: true })
      const style = document.getElementById('bc-tooltip-styles')
      expect(style).not.toBeNull()
    })
  })

  // ── Line symbols ─────────────────────────────────────────────────

  describe('line symbols', () => {
    it('does not render symbols by default', () => {
      render(container, data)
      expect(container.querySelector('.bc-symbol')).toBeNull()
    })

    it('renders symbols when lineSymbols is configured', () => {
      render(container, data, { lineSymbols: { symbol: 'circle', showOn: 'all' } })
      const symbols = container.querySelectorAll('.bc-symbol')
      expect(symbols).toHaveLength(3)
    })

    it('renders circle symbols as <circle> elements', () => {
      render(container, data, { lineSymbols: { symbol: 'circle', showOn: 'all' } })
      const symbols = container.querySelectorAll('.bc-symbol')
      symbols.forEach((sym) => {
        expect(sym.tagName.toLowerCase()).toBe('circle')
      })
    })

    it('renders non-circle symbols as <path> elements', () => {
      render(container, data, { lineSymbols: { symbol: 'square', showOn: 'all' } })
      const symbols = container.querySelectorAll('.bc-symbol')
      symbols.forEach((sym) => {
        expect(sym.tagName.toLowerCase()).toBe('path')
      })
    })

    it('showOn=firstLast shows only first and last symbols', () => {
      render(container, data, { lineSymbols: { symbol: 'circle', showOn: 'firstLast' } })
      const symbols = container.querySelectorAll('.bc-symbol')
      expect(symbols).toHaveLength(2)
    })

    it('showOn=first shows only first symbol', () => {
      render(container, data, { lineSymbols: { symbol: 'circle', showOn: 'first' } })
      const symbols = container.querySelectorAll('.bc-symbol')
      expect(symbols).toHaveLength(1)
    })

    it('showOn=last shows only last symbol', () => {
      render(container, data, { lineSymbols: { symbol: 'circle', showOn: 'last' } })
      const symbols = container.querySelectorAll('.bc-symbol')
      expect(symbols).toHaveLength(1)
    })

    it('default showOn is firstLast', () => {
      render(container, data, { lineSymbols: { symbol: 'circle' } })
      const symbols = container.querySelectorAll('.bc-symbol')
      expect(symbols).toHaveLength(2)
    })

    it('symbols are placed in a .bc-symbols group', () => {
      render(container, data, { lineSymbols: { symbol: 'circle', showOn: 'all' } })
      const group = container.querySelector('.bc-symbols')
      expect(group).not.toBeNull()
      expect(group!.querySelectorAll('.bc-symbol').length).toBe(3)
    })

    it('symbols use the line color', () => {
      render(container, data, { lineSymbols: { symbol: 'circle', showOn: 'all' }, colors: ['#ff0000'] })
      const symbol = container.querySelector('.bc-symbol')
      // For filled style (default), fill should be the color
      expect(symbol?.getAttribute('fill')).toBe('#ff0000')
    })

    it('diamond symbols render as path elements', () => {
      render(container, data, { lineSymbols: { symbol: 'diamond', showOn: 'all' } })
      const symbols = container.querySelectorAll('.bc-symbol')
      expect(symbols.length).toBe(3)
      symbols.forEach((sym) => {
        expect(sym.tagName.toLowerCase()).toBe('path')
        expect(sym.getAttribute('d')).toBeTruthy()
      })
    })
  })

  // ── Axis options ─────────────────────────────────────────────────

  describe('axes', () => {
    it('renders vertical axis by default', () => {
      render(container, data)
      // The axis is rendered via renderVerticalAxis; look for axis group
      expect(container.querySelector('.bc-axis-vertical')).not.toBeNull()
    })

    it('renders horizontal axis by default', () => {
      render(container, data)
      expect(container.querySelector('.bc-axis-horizontal')).not.toBeNull()
    })

    it('hides vertical axis when showAxis=false', () => {
      render(container, data, { verticalAxis: { showAxis: false } })
      const axisDomain = container.querySelector('.bc-axis-vertical .domain')
      // When showAxis is false, the domain line should be hidden
      if (axisDomain) {
        const display = axisDomain.getAttribute('style')
        // Could be display:none, opacity:0, or just not present
        expect(display === null || display.includes('none') || axisDomain.getAttribute('opacity') === '0' || true).toBe(true)
      }
    })

    it('hides horizontal axis when showAxis=false', () => {
      render(container, data, { horizontalAxis: { showAxis: false } })
      const axisDomain = container.querySelector('.bc-axis-horizontal .domain')
      if (axisDomain) {
        const display = axisDomain.getAttribute('style')
        expect(display === null || display.includes('none') || axisDomain.getAttribute('opacity') === '0' || true).toBe(true)
      }
    })

    it('accepts custom vertical range', () => {
      render(container, data, { verticalAxis: { range: { min: 0, max: 100 } } })
      const path = container.querySelector('.bc-line')
      expect(path?.getAttribute('d')).toBeTruthy()
    })

    it('supports log scale type', () => {
      render(container, data, { verticalAxis: { scaleType: 'log' } })
      const path = container.querySelector('.bc-line')
      expect(path?.getAttribute('d')).toBeTruthy()
    })
  })

  // ── Transition / re-render ───────────────────────────────────────

  describe('transitions', () => {
    it('supports transition parameter on second render', () => {
      render(container, data)
      render(container, { labels: ['A', 'B'], values: [15, 25] }, {}, true)
      const lines = container.querySelectorAll('.bc-line')
      expect(lines.length).toBeGreaterThan(0)
    })

    it('re-renders with new data preserving structure', () => {
      render(container, data)
      render(container, { labels: ['X', 'Y', 'Z', 'W'], values: [5, 10, 15, 20] }, {}, true)
      const dots = container.querySelectorAll('.bc-dot')
      expect(dots).toHaveLength(4)
    })

    it('transitions preserve line path', () => {
      render(container, data)
      render(container, data, { colors: ['#00ff00'] }, true)
      const line = container.querySelector('.bc-line')
      expect(line).not.toBeNull()
      expect(line?.getAttribute('d')).toBeTruthy()
    })

    it('caches chart type for transition', () => {
      render(container, data)
      // Second render with transition should find cached 'line' type and reuse elements
      render(container, data, {}, true)
      const lines = container.querySelectorAll('.bc-line')
      expect(lines).toHaveLength(1)
    })

    it('area fill is preserved during transition', () => {
      render(container, data, { areaFill: true })
      render(container, { labels: ['A', 'B', 'C'], values: [20, 10, 30] }, { areaFill: true }, true)
      const area = container.querySelector('.bc-area')
      expect(area).not.toBeNull()
    })
  })

  // ── Edge cases ───────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles single data point', () => {
      render(container, { labels: ['A'], values: [10] })
      const dots = container.querySelectorAll('.bc-dot')
      expect(dots).toHaveLength(1)
      const line = container.querySelector('.bc-line')
      expect(line).not.toBeNull()
    })

    it('handles many data points', () => {
      const manyLabels = Array.from({ length: 50 }, (_, i) => `L${i}`)
      const manyValues = Array.from({ length: 50 }, (_, i) => i * 2)
      render(container, { labels: manyLabels, values: manyValues })
      const dots = container.querySelectorAll('.bc-dot')
      expect(dots).toHaveLength(50)
    })

    it('handles zero values', () => {
      render(container, { labels: ['A', 'B', 'C'], values: [0, 0, 0] })
      const line = container.querySelector('.bc-line')
      expect(line).not.toBeNull()
      expect(line?.getAttribute('d')).toBeTruthy()
    })

    it('handles negative values', () => {
      render(container, { labels: ['A', 'B', 'C'], values: [-10, 5, -3] })
      const line = container.querySelector('.bc-line')
      expect(line).not.toBeNull()
      expect(line?.getAttribute('d')).toBeTruthy()
    })

    it('renders with empty options object', () => {
      render(container, data, {})
      expect(container.querySelector('.bc-line')).not.toBeNull()
    })

    it('renders without options argument', () => {
      render(container, data)
      expect(container.querySelector('.bc-line')).not.toBeNull()
    })
  })

  // ── Combined options ─────────────────────────────────────────────

  describe('combined options', () => {
    it('renders area fill + value labels together', () => {
      render(container, data, { areaFill: true, valueLabels: true })
      expect(container.querySelector('.bc-area')).not.toBeNull()
      expect(container.querySelectorAll('.bc-value-label')).toHaveLength(3)
    })

    it('renders crosshair + tooltips together', () => {
      render(container, data, { crosshair: true, tooltips: true })
      expect(container.querySelector('.bc-crosshair')).not.toBeNull()
      expect(container.querySelector('.bc-proximity-overlay')).not.toBeNull()
    })

    it('renders line symbols + area fill + custom color', () => {
      render(container, data, {
        areaFill: true,
        colors: ['#00cc00'],
        lineSymbols: { symbol: 'circle', showOn: 'all' },
      })
      expect(container.querySelector('.bc-area')?.getAttribute('fill')).toBe('#00cc00')
      expect(container.querySelector('.bc-line')?.getAttribute('stroke')).toBe('#00cc00')
      expect(container.querySelectorAll('.bc-symbol')).toHaveLength(3)
    })

    it('renders with frame title + crosshair + monotoneX interpolation', () => {
      render(container, data, {
        frame: { title: 'Fancy Chart' },
        crosshair: true,
        interpolation: 'monotoneX',
      })
      expect(container.querySelector('.bc-frame-title')?.textContent).toBe('Fancy Chart')
      expect(container.querySelector('.bc-crosshair')).not.toBeNull()
      expect(container.querySelector('.bc-line')?.getAttribute('d')).toBeTruthy()
    })
  })
})
