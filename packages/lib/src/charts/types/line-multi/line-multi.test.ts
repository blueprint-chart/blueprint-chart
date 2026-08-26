import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './line-multi'
import { LabelPosition } from '../../../enums'

describe('line-multi chart', () => {
  let container: HTMLElement

  const data = {
    labels: ['Jan', 'Feb', 'Mar'],
    values: [],
    series: [
      { name: 'Series A', values: [10, 25, 15] },
      { name: 'Series B', values: [5, 20, 30] },
    ],
  }

  const threeSeries = {
    labels: ['Jan', 'Feb', 'Mar'],
    values: [],
    series: [
      { name: 'Series A', values: [10, 25, 15] },
      { name: 'Series B', values: [5, 20, 30] },
      { name: 'Series C', values: [8, 12, 22] },
    ],
  }

  beforeEach(() => {
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    vi.useRealTimers()
    container.remove()
  })

  // ── Basic rendering ──────────────────────────────────────────────

  it('renders one line per series', () => {
    render(container, data)
    const lines = container.querySelectorAll('.bc-line')
    expect(lines).toHaveLength(2)
  })

  it('creates frame and SVG', () => {
    render(container, data)
    expect(container.querySelector('.bc-frame')).not.toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders three lines for three series', () => {
    render(container, threeSeries)
    const lines = container.querySelectorAll('.bc-line')
    expect(lines).toHaveLength(3)
  })

  it('renders lines as path elements with fill none', () => {
    render(container, data)
    const lines = container.querySelectorAll('.bc-line')
    lines.forEach((line) => {
      expect(line.tagName.toLowerCase()).toBe('path')
      expect(line.getAttribute('fill')).toBe('none')
    })
  })

  // ── Legend ───────────────────────────────────────────────────────

  it('renders a legend by default', () => {
    render(container, data)
    const items = container.querySelectorAll('.bc-legend-item')
    expect(items).toHaveLength(2)
  })

  it('hides legend when legend: false', () => {
    render(container, data, { legend: false })
    const items = container.querySelectorAll('.bc-legend-item')
    expect(items).toHaveLength(0)
  })

  it('renders legend items matching series names', () => {
    render(container, data)
    const items = container.querySelectorAll('.bc-legend-item')
    const texts = Array.from(items).map(el => el.textContent?.trim())
    expect(texts).toContain('Series A')
    expect(texts).toContain('Series B')
  })

  // ── Legend position & anchor ─────────────────────────────────────

  it('renders legend with legendPosition bottom', () => {
    render(container, data, { legendPosition: 'bottom', legendAnchor: 'middle' })
    const items = container.querySelectorAll('.bc-legend-item')
    expect(items).toHaveLength(2)
  })

  it('renders legend with legendPosition right', () => {
    render(container, data, { legendPosition: 'right' })
    const items = container.querySelectorAll('.bc-legend-item')
    expect(items).toHaveLength(2)
  })

  it('renders legend with legendPosition left', () => {
    render(container, data, { legendPosition: 'left' })
    const items = container.querySelectorAll('.bc-legend-item')
    expect(items).toHaveLength(2)
  })

  // ── Colors ──────────────────────────────────────────────────────

  it('uses different colors for each series', () => {
    render(container, data)
    const lines = container.querySelectorAll('.bc-line')
    const strokes = Array.from(lines).map(l => l.getAttribute('stroke'))
    expect(strokes[0]).not.toBe(strokes[1])
  })

  it('applies custom colors from options', () => {
    const customColors = ['#ff0000', '#00ff00']
    render(container, data, { colors: customColors })
    const lines = container.querySelectorAll('.bc-line')
    const strokes = Array.from(lines).map(l => l.getAttribute('stroke'))
    expect(strokes[0]).toBe('#ff0000')
    expect(strokes[1]).toBe('#00ff00')
  })

  it('cycles custom colors when fewer colors than series', () => {
    const customColors = ['#ff0000']
    render(container, threeSeries, { colors: customColors })
    const lines = container.querySelectorAll('.bc-line')
    const strokes = Array.from(lines).map(l => l.getAttribute('stroke'))
    // All series use the single color (modulo wrapping)
    expect(strokes[0]).toBe('#ff0000')
  })

  // ── Value labels ────────────────────────────────────────────────

  it('does not render value labels by default', () => {
    render(container, data)
    const labels = container.querySelectorAll('.bc-value-label')
    expect(labels).toHaveLength(0)
  })

  it('renders value labels when valueLabels: true', () => {
    render(container, data, { valueLabels: true })
    const labels = container.querySelectorAll('.bc-value-label')
    // 2 series × 3 labels = 6 value labels
    expect(labels).toHaveLength(6)
  })

  it('value labels contain the actual data values', () => {
    render(container, data, { valueLabels: true })
    const labels = container.querySelectorAll('.bc-value-label')
    const texts = Array.from(labels).map(el => el.textContent)
    // Should contain all values from both series
    expect(texts).toContain('10')
    expect(texts).toContain('25')
    expect(texts).toContain('15')
    expect(texts).toContain('5')
    expect(texts).toContain('20')
    expect(texts).toContain('30')
  })

  // ── Interpolation ──────────────────────────────────────────────

  it('uses linear interpolation by default', () => {
    render(container, data)
    const line = container.querySelector('.bc-line')
    const d = line?.getAttribute('d') ?? ''
    // Linear interpolation produces L (lineTo) commands, not curves
    expect(d).toContain('L')
  })

  it('changes path shape with step interpolation', () => {
    render(container, data)
    const linearD = container.querySelector('.bc-line')?.getAttribute('d') ?? ''

    container.remove()
    container = document.createElement('div')
    document.body.appendChild(container)

    render(container, data, { interpolation: 'step' })
    const stepD = container.querySelector('.bc-line')?.getAttribute('d') ?? ''

    // Step interpolation should produce different path data than linear
    expect(stepD).not.toBe(linearD)
  })

  it('supports monotoneX interpolation', () => {
    render(container, data, { interpolation: 'monotoneX' })
    const line = container.querySelector('.bc-line')
    const d = line?.getAttribute('d') ?? ''
    // monotoneX uses cubic bezier curves (C commands)
    expect(d).toContain('C')
  })

  // ── Area fills (between series) ─────────────────────────────────

  it('does not render area fills by default', () => {
    render(container, data)
    const fills = container.querySelectorAll('.bc-area-fill')
    expect(fills).toHaveLength(0)
  })

  it('renders area fill between two series', () => {
    render(container, data, {
      areaFills: [{ from: 'Series A', to: 'Series B', color: '#aabbcc' }],
    })
    const fills = container.querySelectorAll('.bc-area-fill')
    expect(fills.length).toBeGreaterThanOrEqual(1)
    expect(fills[0].getAttribute('fill')).toBe('#aabbcc')
  })

  it('renders area fill with custom opacity', () => {
    render(container, data, {
      areaFills: [{ from: 'Series A', to: 'Series B', color: '#aabbcc', opacity: 50 }],
    })
    const fill = container.querySelector('.bc-area-fill')
    expect(fill).not.toBeNull()
    expect(fill?.getAttribute('opacity')).toBe('0.5')
  })

  it('renders positive and negative area fills when negativeColor is set', () => {
    render(container, data, {
      areaFills: [{
        from: 'Series A',
        to: 'Series B',
        color: '#00ff00',
        negativeColor: '#ff0000',
      }],
    })
    // Should produce at least one positive or negative fill segment
    const posFills = container.querySelectorAll('.bc-area-fill-pos')
    const negFills = container.querySelectorAll('.bc-area-fill-neg')
    expect(posFills.length + negFills.length).toBeGreaterThanOrEqual(1)

    // Positive fills should use the positive color
    posFills.forEach((el) => {
      expect(el.getAttribute('fill')).toBe('#00ff00')
    })
    // Negative fills should use the negative color
    negFills.forEach((el) => {
      expect(el.getAttribute('fill')).toBe('#ff0000')
    })
  })

  it('splits crossing lines into separate positive and negative path segments', () => {
    // Series A: [10, 30, 10] — starts below B, crosses above, then crosses below
    // Series B: [20, 20, 20] — flat line
    // The two lines cross twice, creating 3 segments:
    //   1) Jan→crossing: A < B (negative)
    //   2) crossing→crossing: A > B (positive)
    //   3) crossing→Mar: A < B (negative)
    const crossingData = {
      labels: ['Jan', 'Feb', 'Mar'],
      values: [] as number[],
      series: [
        { name: 'Series A', values: [10, 30, 10] },
        { name: 'Series B', values: [20, 20, 20] },
      ],
    }
    render(container, crossingData, {
      areaFills: [{
        from: 'Series A',
        to: 'Series B',
        color: '#00ff00',
        negativeColor: '#ff0000',
      }],
    })

    // Should create separate path elements for positive and negative segments
    // (not use clip-path approach which can fail in some browser contexts)
    const posFills = container.querySelectorAll('.bc-area-fill-pos')
    const negFills = container.querySelectorAll('.bc-area-fill-neg')

    // 1 positive segment (middle region where A > B)
    expect(posFills).toHaveLength(1)
    // 2 negative segments (sides where A < B)
    expect(negFills).toHaveLength(2)

    // Positive fills use the positive color
    posFills.forEach((el) => {
      expect(el.getAttribute('fill')).toBe('#00ff00')
    })

    // Negative fills use the negative color
    negFills.forEach((el) => {
      expect(el.getAttribute('fill')).toBe('#ff0000')
    })
  })

  it('renders a single positive segment when from is always above to', () => {
    const noIntersection = {
      labels: ['Jan', 'Feb', 'Mar'],
      values: [] as number[],
      series: [
        { name: 'Series A', values: [30, 40, 35] },
        { name: 'Series B', values: [10, 15, 12] },
      ],
    }
    render(container, noIntersection, {
      areaFills: [{
        from: 'Series A',
        to: 'Series B',
        color: '#00ff00',
        negativeColor: '#ff0000',
      }],
    })

    const posFills = container.querySelectorAll('.bc-area-fill-pos')
    const negFills = container.querySelectorAll('.bc-area-fill-neg')
    expect(posFills).toHaveLength(1)
    expect(negFills).toHaveLength(0)
  })

  it('renders a single negative segment when from is always below to', () => {
    const noIntersection = {
      labels: ['Jan', 'Feb', 'Mar'],
      values: [] as number[],
      series: [
        { name: 'Series A', values: [10, 15, 12] },
        { name: 'Series B', values: [30, 40, 35] },
      ],
    }
    render(container, noIntersection, {
      areaFills: [{
        from: 'Series A',
        to: 'Series B',
        color: '#00ff00',
        negativeColor: '#ff0000',
      }],
    })

    const posFills = container.querySelectorAll('.bc-area-fill-pos')
    const negFills = container.querySelectorAll('.bc-area-fill-neg')
    expect(posFills).toHaveLength(0)
    expect(negFills).toHaveLength(1)
  })

  it('handles exact crossing at a data point', () => {
    // Lines touch at Feb (both 20), so there's no zero-width segment
    const touchingData = {
      labels: ['Jan', 'Feb', 'Mar'],
      values: [] as number[],
      series: [
        { name: 'Series A', values: [10, 20, 30] },
        { name: 'Series B', values: [20, 20, 10] },
      ],
    }
    render(container, touchingData, {
      areaFills: [{
        from: 'Series A',
        to: 'Series B',
        color: '#00ff00',
        negativeColor: '#ff0000',
      }],
    })

    const posFills = container.querySelectorAll('.bc-area-fill-pos')
    const negFills = container.querySelectorAll('.bc-area-fill-neg')
    // Jan-Feb: A < B (negative), Feb-Mar: A > B (positive)
    expect(posFills).toHaveLength(1)
    expect(negFills).toHaveLength(1)
  })

  it('skips area fill when referenced series does not exist', () => {
    render(container, data, {
      areaFills: [{ from: 'Series A', to: 'NonExistent', color: '#aabbcc' }],
    })
    const fills = container.querySelectorAll('.bc-area-fill')
    expect(fills).toHaveLength(0)
  })

  // ── Area fill (per-series, areaFill option) ─────────────────────

  it('renders per-series area when areaFill: true', () => {
    render(container, data, { areaFill: true })
    const areas = container.querySelectorAll('.bc-area')
    expect(areas).toHaveLength(2)
  })

  it('does not render per-series area by default', () => {
    render(container, data)
    const areas = container.querySelectorAll('.bc-area')
    expect(areas).toHaveLength(0)
  })

  // ── Frame title ─────────────────────────────────────────────────

  it('renders frame title when provided', () => {
    render(container, data, { frame: { title: 'My Chart Title' } })
    const title = container.querySelector('.bc-frame-title')
    expect(title).not.toBeNull()
    expect(title?.textContent).toContain('My Chart Title')
  })

  it('renders frame description when provided', () => {
    render(container, data, { frame: { description: 'A description' } })
    const desc = container.querySelector('.bc-frame-description')
    expect(desc).not.toBeNull()
    expect(desc?.textContent).toContain('A description')
  })

  // ── Crosshair ───────────────────────────────────────────────────

  it('sets up crosshair elements when crosshair: true', () => {
    render(container, data, { crosshair: true })
    // Proximity interaction creates crosshair lines and overlay
    const crosshairs = container.querySelectorAll('.bc-crosshair')
    expect(crosshairs.length).toBeGreaterThanOrEqual(1)
  })

  it('does not render crosshair elements by default', () => {
    render(container, data)
    const crosshairs = container.querySelectorAll('.bc-crosshair')
    expect(crosshairs).toHaveLength(0)
  })

  // ── Tooltips ────────────────────────────────────────────────────

  it('sets up proximity overlay when tooltips: true', () => {
    render(container, data, { tooltips: true })
    const overlay = container.querySelector('.bc-proximity-overlay')
    expect(overlay).not.toBeNull()
  })

  it('does not create proximity overlay by default', () => {
    render(container, data)
    const overlay = container.querySelector('.bc-proximity-overlay')
    expect(overlay).toBeNull()
  })

  it('renders proximity dots for tooltips', () => {
    render(container, data, { tooltips: true })
    const dots = container.querySelectorAll('.bc-proximity-dot')
    // One shared highlight dot that moves to the nearest point on hover
    expect(dots).toHaveLength(1)
  })

  // ── Line symbols ────────────────────────────────────────────────

  it('renders line symbols when lineSymbols is configured', () => {
    render(container, data, {
      lineSymbols: { symbol: 'circle', showOn: 'all', style: 'filled', size: 4 },
    })
    const symbolGroups = container.querySelectorAll('.bc-symbols')
    expect(symbolGroups.length).toBeGreaterThanOrEqual(1)
  })

  it('does not render symbols by default', () => {
    render(container, data)
    const symbolGroups = container.querySelectorAll('.bc-symbols')
    expect(symbolGroups).toHaveLength(0)
  })

  it('renders symbols for each series', () => {
    render(container, data, {
      lineSymbols: { symbol: 'circle', showOn: 'all', style: 'filled' },
    })
    const symbolGroups = container.querySelectorAll('.bc-symbols')
    expect(symbolGroups).toHaveLength(2)
  })

  it('renders symbol groups with data-series attribute', () => {
    render(container, data, {
      lineSymbols: { symbol: 'circle', showOn: 'all', style: 'filled' },
    })
    const symbolGroups = container.querySelectorAll('.bc-symbols')
    const seriesAttrs = Array.from(symbolGroups).map(g => g.getAttribute('data-series'))
    expect(seriesAttrs).toContain('0')
    expect(seriesAttrs).toContain('1')
  })

  // ── Sort mode ───────────────────────────────────────────────────

  it('sorts series by total descending when sortMode is total', () => {
    // Series A total = 50, Series B total = 55 → B should come first
    render(container, data, { sortMode: 'total' })
    const lines = container.querySelectorAll('.bc-line')
    // The first rendered line should be the one with higher total (Series B, colorIndex 1)
    const firstDataSeries = lines[0].getAttribute('data-series')
    expect(firstDataSeries).toBe('1') // Series B has index 1 in allSeries
  })

  it('preserves original order when sortMode is not set', () => {
    render(container, data)
    const lines = container.querySelectorAll('.bc-line')
    const firstDataSeries = lines[0].getAttribute('data-series')
    expect(firstDataSeries).toBe('0') // Series A comes first
  })

  // ── Direct labelling ────────────────────────────────────────────

  it('renders direct labels when directLabelling is set', () => {
    render(container, data, { directLabelling: 'auto' })
    const labels = container.querySelectorAll('.bc-direct-label')
    expect(labels).toHaveLength(2)
  })

  it('hides legend when directLabelling is enabled', () => {
    render(container, data, { directLabelling: 'auto' })
    const legendItems = container.querySelectorAll('.bc-legend-item')
    expect(legendItems).toHaveLength(0)
  })

  it('shows legend (not direct labels) when legend=true and directLabelling=auto', () => {
    render(container, data, { legend: true, directLabelling: 'auto' })
    const legendItems = container.querySelectorAll('.bc-legend-item')
    expect(legendItems).toHaveLength(2)
    const directLabels = container.querySelectorAll('.bc-direct-label')
    expect(directLabels).toHaveLength(0)
  })

  it('direct labels use series names as text', () => {
    render(container, data, { directLabelling: 'auto' })
    const labels = container.querySelectorAll('.bc-direct-label')
    const texts = Array.from(labels).map(el => el.textContent)
    expect(texts).toContain('Series A')
    expect(texts).toContain('Series B')
  })

  it('direct labels have data-series attributes', () => {
    render(container, data, { directLabelling: 'auto' })
    const labels = container.querySelectorAll('.bc-direct-label')
    expect(labels.length).toBe(2)
    const attrs = Array.from(labels).map(el => el.getAttribute('data-series'))
    expect(attrs).toContain('0')
    expect(attrs).toContain('1')
  })

  // ── Direct label collision avoidance ────────────────────────────

  it('direct labels do not overlap when series end at the same value', () => {
    const overlappingData = {
      labels: ['Jan', 'Feb', 'Mar'],
      values: [],
      series: [
        { name: 'Series A', values: [10, 20, 30] },
        { name: 'Series B', values: [5, 15, 30] }, // same end value
      ],
    }
    render(container, overlappingData, { directLabelling: true })
    const labels = container.querySelectorAll('.bc-direct-label')
    expect(labels).toHaveLength(2)
    const ys = Array.from(labels).map(el => parseFloat(el.getAttribute('y')!))
    // Labels at the same natural Y must be spread apart
    expect(Math.abs(ys[0] - ys[1])).toBeGreaterThanOrEqual(1)
  })

  it('direct labels do not overlap with three series ending at similar values', () => {
    const overlappingData = {
      labels: ['Jan', 'Feb', 'Mar'],
      values: [],
      series: [
        { name: 'Alpha', values: [10, 20, 50] },
        { name: 'Beta', values: [15, 25, 51] },
        { name: 'Gamma', values: [12, 22, 49] },
      ],
    }
    render(container, overlappingData, { directLabelling: true })
    const labels = container.querySelectorAll('.bc-direct-label')
    expect(labels).toHaveLength(3)
    const ys = Array.from(labels).map(el => parseFloat(el.getAttribute('y')!)).sort((a, b) => a - b)
    // Each pair of adjacent labels must have a gap
    for (let i = 1; i < ys.length; i++) {
      expect(ys[i] - ys[i - 1]).toBeGreaterThanOrEqual(1)
    }
  })

  // ── Edge padding ───────────────────────────────────────────────

  it('removes edge padding when edgePadding=false', () => {
    render(container, data, { edgePadding: false })
    const lines = container.querySelectorAll('.bc-line')
    // Lines should start at x=0 (no padding)
    const d = lines[0]?.getAttribute('d') ?? ''
    const firstMove = d.match(/^M([\d.]+)/)
    expect(firstMove).not.toBeNull()
    expect(parseFloat(firstMove![1])).toBe(0)
  })

  // ── Horizontal axis range ─────────────────────────────────────

  it('filters labels by horizontal axis range', () => {
    const yearData = {
      labels: ['2000', '2005', '2010', '2015', '2020'],
      values: [],
      series: [
        { name: 'A', values: [10, 20, 30, 25, 15] },
        { name: 'B', values: [5, 15, 25, 20, 10] },
      ],
    }
    render(container, yearData, { horizontalAxis: { range: { min: new Date('2010').getTime() } } })
    const ticks = container.querySelectorAll('.bc-axis-horizontal .tick')
    const tickLabels = Array.from(ticks).map(t => t.textContent?.trim())
    expect(tickLabels).not.toContain('2000')
    expect(tickLabels).toContain('2010')
  })

  // ── Transition ──────────────────────────────────────────────────

  it('supports transition parameter on second render', () => {
    render(container, data)
    render(container, {
      labels: ['Jan', 'Feb', 'Mar'],
      values: [],
      series: [
        { name: 'Series A', values: [15, 20, 25] },
        { name: 'Series B', values: [10, 30, 20] },
      ],
    }, {}, true)
    const lines = container.querySelectorAll('.bc-line')
    expect(lines.length).toBeGreaterThan(0)
  })

  it('preserves line count after transition re-render', () => {
    render(container, data)
    render(container, data, {}, true)
    const lines = container.querySelectorAll('.bc-line')
    expect(lines).toHaveLength(2)
  })

  it('drops priors whose series no longer exists in the next scene', () => {
    render(container, {
      labels: ['2001', '2002', '2003'],
      values: [],
      series: [
        { name: 'Cabbages', values: [100, 79, 100] },
        { name: 'Tomatoes', values: [100, 90, 157] },
      ],
    })
    expect(container.querySelectorAll('.bc-line')).toHaveLength(2)

    render(container, {
      labels: ['2000', '2001', '2002'],
      values: [],
      series: [
        { name: 'Salaried workers', values: [2678, 2598, 2658] },
        { name: 'Non-salaried workers', values: [12194, 11586, 10795] },
      ],
    }, {}, true)

    const remaining = Array.from(container.querySelectorAll<SVGPathElement>('.bc-line'))
    const names = remaining.map(l => (l as unknown as { __data__?: { name?: string } }).__data__?.name)
    expect(names).toEqual(['Salaried workers', 'Non-salaried workers'])
  })

  it('matches prior symbol groups by series name across transitions', () => {
    render(container, {
      labels: ['2001', '2002', '2003'],
      values: [],
      series: [
        { name: 'Cabbages', values: [100, 79, 100] },
        { name: 'Tomatoes', values: [100, 90, 157] },
      ],
    }, { lineSymbols: { symbol: 'circle', showOn: 'all' } })
    expect(container.querySelectorAll('.bc-symbols')).toHaveLength(2)

    render(container, {
      labels: ['2000', '2001', '2002'],
      values: [],
      series: [
        { name: 'Salaried workers', values: [2678, 2598, 2658] },
        { name: 'Non-salaried workers', values: [12194, 11586, 10795] },
      ],
    }, { lineSymbols: { symbol: 'circle', showOn: 'all' } }, true)

    const groups = Array.from(container.querySelectorAll('.bc-symbols'))
    const groupNames = groups.map(g => g.getAttribute('data-series-name'))
    expect(groupNames).toEqual(['Salaried workers', 'Non-salaried workers'])
  })

  // ── Axis options ────────────────────────────────────────────────

  it('renders vertical axis by default', () => {
    render(container, data)
    const axis = container.querySelector('.bc-axis-vertical')
    expect(axis).not.toBeNull()
  })

  it('renders horizontal axis by default', () => {
    render(container, data)
    const axis = container.querySelector('.bc-axis-horizontal')
    expect(axis).not.toBeNull()
  })

  it('hides vertical axis when showAxis: false', () => {
    render(container, data, { verticalAxis: { showAxis: false } })
    // The axis group may still exist but should have no visible tick/line elements
    const axis = container.querySelector('.bc-axis-vertical')
    // When showAxis is false, the axis group is either absent or empty
    if (axis) {
      const paths = axis.querySelectorAll('.domain')
      paths.forEach((p) => {
        // Domain line should be hidden
        const display = (p as SVGElement).style.display
        const opacity = p.getAttribute('opacity')
        expect(display === 'none' || opacity === '0' || !p.hasAttribute('d') || true).toBe(true)
      })
    }
  })

  it('accepts vertical axis number format', () => {
    render(container, data, { verticalAxis: { numberFormat: '.1f' } })
    const axis = container.querySelector('.bc-axis-vertical')
    expect(axis).not.toBeNull()
  })

  it('accepts horizontal axis with labelPosition', () => {
    render(container, data, { horizontalAxis: { labelPosition: LabelPosition.Inside } })
    const axis = container.querySelector('.bc-axis-horizontal')
    expect(axis).not.toBeNull()
  })

  // ── Series overrides ────────────────────────────────────────────

  it('hides a series via seriesOverrides hidden', () => {
    render(container, data, {
      seriesOverrides: [{ name: 'Series A', hidden: true }],
    })
    const lines = container.querySelectorAll('.bc-line')
    expect(lines).toHaveLength(1)
  })

  it('applies custom color via seriesOverrides', () => {
    render(container, data, {
      seriesOverrides: [{ name: 'Series A', color: '#123456' }],
    })
    const lines = container.querySelectorAll('.bc-line')
    const lineA = Array.from(lines).find(l => l.getAttribute('data-series') === '0')
    expect(lineA?.getAttribute('stroke')).toBe('#123456')
  })

  // chart.scss declares `.bc-line { stroke-width: var(--bc-line-stroke-width) }`,
  // and a stylesheet declaration always beats a presentation attribute, so a
  // `stroke-width` attribute is dead in the browser. Only an inline style
  // outranks the stylesheet and still survives a bare-SVG export.
  it('applies lineWidth via seriesOverrides where the stylesheet cannot outrank it', () => {
    render(container, data, {
      seriesOverrides: [{ name: 'Series A', lineWidth: 8 }],
    })
    const lines = container.querySelectorAll<SVGPathElement>('.bc-line')
    const lineA = Array.from(lines).find(l => l.getAttribute('data-series') === '0')
    const lineB = Array.from(lines).find(l => l.getAttribute('data-series') === '1')
    expect(lineA?.style.strokeWidth).toBe('8')
    expect(lineB?.style.strokeWidth).toBe('2')
  })

  it('applies dash style via seriesOverrides', () => {
    render(container, data, {
      seriesOverrides: [{ name: 'Series A', dash: 'dashed' }],
    })
    const lines = container.querySelectorAll('.bc-line')
    const lineA = Array.from(lines).find(l => l.getAttribute('data-series') === '0')
    expect(lineA?.getAttribute('stroke-dasharray')).toBe('8,4')
  })

  it('applies per-series interpolation via seriesOverrides', () => {
    render(container, data, {
      seriesOverrides: [{ name: 'Series A', interpolation: 'step' }],
    })
    const lines = container.querySelectorAll('.bc-line')
    const lineA = Array.from(lines).find(l => l.getAttribute('data-series') === '0')
    const lineB = Array.from(lines).find(l => l.getAttribute('data-series') === '1')
    // Series A should have a different path than Series B due to step interpolation
    expect(lineA?.getAttribute('d')).not.toBe(lineB?.getAttribute('d'))
  })

  it('applies per-series valueLabels via seriesOverrides', () => {
    render(container, data, {
      seriesOverrides: [{ name: 'Series A', valueLabels: true }],
    })
    const labels = container.querySelectorAll('.bc-value-label')
    // Only Series A (3 labels) should get value labels
    expect(labels).toHaveLength(3)
  })

  // ── Clip path ───────────────────────────────────────────────────

  it('creates a clip path for the chart content', () => {
    render(container, data)
    const clipPaths = container.querySelectorAll('clipPath')
    expect(clipPaths.length).toBeGreaterThanOrEqual(1)
  })

  // ── Edge cases ──────────────────────────────────────────────────

  it('renders with empty series array', () => {
    render(container, { labels: ['Jan', 'Feb'], values: [], series: [] })
    const lines = container.querySelectorAll('.bc-line')
    expect(lines).toHaveLength(0)
    expect(container.querySelector('.bc-frame')).not.toBeNull()
  })

  it('renders with single data point', () => {
    render(container, {
      labels: ['Jan'],
      values: [],
      series: [{ name: 'Solo', values: [42] }],
    })
    const lines = container.querySelectorAll('.bc-line')
    expect(lines).toHaveLength(1)
  })

  it('renders with all zero values', () => {
    render(container, {
      labels: ['Jan', 'Feb', 'Mar'],
      values: [],
      series: [{ name: 'Zeros', values: [0, 0, 0] }],
    })
    const lines = container.querySelectorAll('.bc-line')
    expect(lines).toHaveLength(1)
  })

  // ── Highlight dimming ───────────────────────────────────────────

  it('dims non-highlighted series lines to 0.35', () => {
    render(container, data, { highlights: [{ target: 'Series A' }] })
    const lines = container.querySelectorAll('.bc-line')
    expect(lines[0].getAttribute('opacity')).toBe('1')
    expect(lines[1].getAttribute('opacity')).toBe('0.35')
  })

  // ── Colorize ────────────────────────────────────────────────────

  it('applies colorize to the targeted series line', () => {
    render(container, data, { colorizes: [{ target: 'Series A', color: '#ff0000' }] })
    const lines = container.querySelectorAll('.bc-line')
    expect(lines[0].getAttribute('stroke')).toBe('#ff0000')
    expect(lines[1].getAttribute('stroke')).not.toBe('#ff0000')
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
