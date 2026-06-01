import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './donut'
import { SortDirection } from '../../../enums'

describe('donut chart', () => {
  let container: HTMLElement

  const data = {
    labels: ['A', 'B', 'C'],
    values: [30, 50, 20],
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

  it('renders arc paths', () => {
    render(container, data)
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs).toHaveLength(3)
  })

  it('each arc has a d attribute', () => {
    render(container, data)
    const arcs = container.querySelectorAll('.bc-arc')
    arcs.forEach((arc) => {
      expect(arc.getAttribute('d')).toBeTruthy()
    })
  })

  it('creates frame and SVG structure', () => {
    render(container, data)
    expect(container.querySelector('.bc-frame')).not.toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('creates frame with title', () => {
    render(container, data, { frame: { title: 'Donut' } })
    expect(container.querySelector('.bc-frame-title')?.textContent).toBe('Donut')
  })

  // ── Donut hole (inner radius) ────────────────────────────────────

  it('has inner radius (donut hole) — arc path contains two arcs', () => {
    render(container, data)
    const arc = container.querySelector('.bc-arc')
    const d = arc?.getAttribute('d') ?? ''
    // A donut arc path has two arc commands (outer and inner), while a pie
    // path has only one.  Count uppercase 'A' commands in the path.
    const arcCommands = d.match(/A/g) ?? []
    expect(arcCommands.length).toBeGreaterThanOrEqual(2)
  })

  // ── Legend ────────────────────────────────────────────────────────

  it('renders a legend by default', () => {
    render(container, data)
    const items = container.querySelectorAll('.bc-legend-item')
    expect(items).toHaveLength(3)
  })

  it('hides legend when legend option is false', () => {
    render(container, data, { legend: false })
    const legend = container.querySelector('.bc-legend')
    expect(legend).toBeNull()
  })

  it('positions legend at the bottom when legendPosition is bottom', () => {
    render(container, data, { legendPosition: 'bottom' })
    const legend = container.querySelector('.bc-legend')
    expect(legend).not.toBeNull()
    // The legend group should have a transform with a positive y offset
    // (below the chart area), meaning its translate y > 0
    const transform = legend?.getAttribute('transform') ?? ''
    const match = transform.match(/translate\(\s*[\d.e+-]+\s*,\s*([\d.e+-]+)\s*\)/)
    expect(match).not.toBeNull()
    const yOffset = parseFloat(match![1])
    expect(yOffset).toBeGreaterThan(0)
  })

  // ── Colors ────────────────────────────────────────────────────────

  it('applies custom colors to arcs', () => {
    const customColors = ['#ff0000', '#00ff00', '#0000ff']
    render(container, data, { colors: customColors })
    const arcs = container.querySelectorAll('.bc-arc')
    arcs.forEach((arc, i) => {
      expect(arc.getAttribute('fill')).toBe(customColors[i])
    })
  })

  // ── Display as percentage ─────────────────────────────────────────

  it('shows percentage values in legend when displayAsPercentage is true', () => {
    render(container, data, { displayAsPercentage: true })
    const legendItems = container.querySelectorAll('.bc-legend-item')
    // Legend items should contain percentage text like "(30%)" etc.
    const allText = Array.from(legendItems).map(el => el.textContent ?? '')
    expect(allText.some(t => t.includes('%'))).toBe(true)
  })

  // ── Show total ────────────────────────────────────────────────────

  it('shows center total when showTotal is true', () => {
    render(container, data, { showTotal: true })
    const totalLabel = container.querySelector('.bc-arc-total-label')
    const totalValue = container.querySelector('.bc-arc-total-value')
    expect(totalLabel).not.toBeNull()
    expect(totalLabel?.textContent).toBe('Total')
    expect(totalValue).not.toBeNull()
    expect(totalValue?.textContent).toBe('100')
  })

  it('does not show center total by default', () => {
    render(container, data)
    const totalValue = container.querySelector('.bc-arc-total-value')
    expect(totalValue).toBeNull()
  })

  it('suppresses center total when displayAsPercentage is true (would always read 100%)', () => {
    render(container, data, { showTotal: true, displayAsPercentage: true })
    const totalValue = container.querySelector('.bc-arc-total-value')
    expect(totalValue).toBeNull()
  })

  // ── Show/hide labels ──────────────────────────────────────────────

  it('shows label text in legend items by default', () => {
    render(container, data)
    const legendItems = container.querySelectorAll('.bc-legend-item')
    const texts = Array.from(legendItems).map(el => el.textContent ?? '')
    expect(texts.some(t => t.includes('A'))).toBe(true)
    expect(texts.some(t => t.includes('B'))).toBe(true)
    expect(texts.some(t => t.includes('C'))).toBe(true)
  })

  // ── Show/hide values ─────────────────────────────────────────────

  it('shows value suffixes in legend by default', () => {
    render(container, data)
    const legendItems = container.querySelectorAll('.bc-legend-item')
    const allText = Array.from(legendItems).map(el => el.textContent ?? '').join(' ')
    // Values should appear as suffixes like "(30)"
    expect(allText).toContain('30')
    expect(allText).toContain('50')
    expect(allText).toContain('20')
  })

  it('hides value suffixes in legend when showValues is false', () => {
    render(container, data, { showValues: false })
    const legendItems = container.querySelectorAll('.bc-legend-item')
    const allText = Array.from(legendItems).map(el => el.textContent ?? '').join(' ')
    // With showValues false the raw numeric suffixes should not appear
    // Legend text should just be the labels
    expect(allText).not.toContain('(30)')
    expect(allText).not.toContain('(50)')
    expect(allText).not.toContain('(20)')
  })

  // ── Slice max (auto-grouping) ─────────────────────────────────────

  it('groups slices into "Others" when sliceMax is set', () => {
    const manyData = {
      labels: ['A', 'B', 'C', 'D', 'E'],
      values: [40, 30, 15, 10, 5],
    }
    render(container, manyData, { sliceMax: 3 })
    const arcs = container.querySelectorAll('.bc-arc')
    // sliceMax=3 means keep 2 + 1 "Others" = 3 arcs
    expect(arcs).toHaveLength(3)
    // Legend should also have 3 items, including "Others"
    const legendItems = container.querySelectorAll('.bc-legend-item')
    expect(legendItems).toHaveLength(3)
    const legendText = Array.from(legendItems).map(el => el.textContent ?? '').join(' ')
    expect(legendText).toContain('Others')
  })

  it('uses custom sliceGroupLabel instead of "Others"', () => {
    const manyData = {
      labels: ['A', 'B', 'C', 'D'],
      values: [40, 30, 20, 10],
    }
    render(container, manyData, { sliceMax: 2, sliceGroupLabel: 'Rest' })
    const legendItems = container.querySelectorAll('.bc-legend-item')
    const legendText = Array.from(legendItems).map(el => el.textContent ?? '').join(' ')
    expect(legendText).toContain('Rest')
    expect(legendText).not.toContain('Others')
  })

  // ── Sort ──────────────────────────────────────────────────────────

  it('sorts arcs in descending order', () => {
    render(container, data, { sort: SortDirection.Descending })
    const legendItems = container.querySelectorAll('.bc-legend-item')
    const labels = Array.from(legendItems).map((el) => {
      // The first tspan or direct text content is the label
      const tspan = el.querySelector('tspan')
      return tspan ? tspan.textContent : el.querySelector('text')?.textContent ?? ''
    })
    // Descending by value: B(50), A(30), C(20)
    expect(labels[0]).toBe('B')
    expect(labels[1]).toBe('A')
    expect(labels[2]).toBe('C')
  })

  it('sorts arcs in ascending order', () => {
    render(container, data, { sort: SortDirection.Ascending })
    const legendItems = container.querySelectorAll('.bc-legend-item')
    const labels = Array.from(legendItems).map((el) => {
      const tspan = el.querySelector('tspan')
      return tspan ? tspan.textContent : el.querySelector('text')?.textContent ?? ''
    })
    // Ascending by value: C(20), A(30), B(50)
    expect(labels[0]).toBe('C')
    expect(labels[1]).toBe('A')
    expect(labels[2]).toBe('B')
  })

  // ── Direct labelling ──────────────────────────────────────────────

  it('renders direct arc labels when directLabelling is "auto"', () => {
    render(container, data, { directLabelling: 'auto' })
    // Direct labelling should hide the legend
    const legend = container.querySelector('.bc-legend')
    expect(legend).toBeNull()
    // Arc labels group should be present
    const arcLabels = container.querySelector('.bc-arc-labels, .bc-arc-labels-inside')
    expect(arcLabels).not.toBeNull()
  })

  it('hides legend when directLabelling is enabled', () => {
    render(container, data, { directLabelling: true })
    const legend = container.querySelector('.bc-legend')
    expect(legend).toBeNull()
  })

  // ── Tooltips ──────────────────────────────────────────────────────

  it('registers tooltip plugin when tooltips option is true', () => {
    render(container, data, { tooltips: true })
    // The chart should still render normally with tooltips enabled
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs).toHaveLength(3)
  })

  // ── Transition ────────────────────────────────────────────────────

  it('supports transition parameter on second render', () => {
    render(container, data)
    render(container, { labels: ['X', 'Y'], values: [40, 60] }, {}, true)
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs.length).toBeGreaterThan(0)
  })

  it('handles transition from different data sizes', () => {
    render(container, data)
    render(container, { labels: ['X'], values: [100] }, {}, true)
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs.length).toBeGreaterThanOrEqual(1)
  })

  // ── Edge cases ────────────────────────────────────────────────────

  it('renders with single data point', () => {
    render(container, { labels: ['Only'], values: [100] })
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs).toHaveLength(1)
  })

  it('renders with zero values', () => {
    render(container, { labels: ['A', 'B'], values: [0, 0] })
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs).toHaveLength(2)
  })

  it('does not group when sliceMax exceeds data length', () => {
    render(container, data, { sliceMax: 10 })
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs).toHaveLength(3)
  })

  // ── Highlight / dimming ───────────────────────────────────────────

  it('dims non-highlighted arcs to 0.35', () => {
    render(container, data, { highlights: [{ target: 'A' }] })
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs[0].getAttribute('opacity')).toBe('1')
    expect(arcs[1].getAttribute('opacity')).toBe('0.35')
  })

  it('does not dim arcs when no highlight is set', () => {
    render(container, data)
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs[0].getAttribute('opacity')).not.toBe('0.35')
  })

  // ── Colorize ──────────────────────────────────────────────────────

  it('applies colorize to the targeted arc, leaving others on the palette', () => {
    render(container, data, { colorizes: [{ target: 'A', color: '#ff0000' }] })
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs[0].getAttribute('fill')).toBe('#ff0000')
    expect(arcs[1].getAttribute('fill')).not.toBe('#ff0000')
  })

  it('colorize composes with highlight (recolour + dim others)', () => {
    render(container, data, { colorizes: [{ target: 'A', color: '#ff0000' }], highlights: [{ target: 'A' }] })
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs[0].getAttribute('fill')).toBe('#ff0000')
    expect(arcs[0].getAttribute('opacity')).toBe('1')
    expect(arcs[1].getAttribute('opacity')).toBe('0.35')
  })

  it('omits the opacity attribute on arcs when no highlight is set', () => {
    render(container, data)
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs[0].getAttribute('opacity')).toBeNull()
  })
})
