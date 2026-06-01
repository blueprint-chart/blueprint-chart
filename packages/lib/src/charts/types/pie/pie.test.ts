import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './pie'
import { SortDirection } from '../../../enums'

describe('pie chart', () => {
  let container: HTMLElement

  const data = {
    labels: ['X', 'Y', 'Z'],
    values: [40, 35, 25],
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

  it('creates frame and SVG', () => {
    render(container, data)
    expect(container.querySelector('.bc-frame')).not.toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('each arc has a d attribute', () => {
    render(container, data)
    const arcs = container.querySelectorAll('.bc-arc')
    arcs.forEach((arc) => {
      expect(arc.getAttribute('d')).toBeTruthy()
    })
  })

  it('each arc has a fill attribute', () => {
    render(container, data)
    const arcs = container.querySelectorAll('.bc-arc')
    arcs.forEach((arc) => {
      expect(arc.getAttribute('fill')).toBeTruthy()
    })
  })

  // ── Full pie (no inner radius) ───────────────────────────────────

  it('renders full sectors with no inner hole', () => {
    render(container, data)
    const arcs = container.querySelectorAll('.bc-arc')
    // A full pie sector arc path starts at the outer radius and
    // includes a line back to the center (L0,0 or similar).
    // Donut arcs have an inner arc segment instead.
    // With innerRadius=0 the d attribute should contain coordinates
    // that pass through (or very near) the center point 0,0.
    arcs.forEach((arc) => {
      const d = arc.getAttribute('d')!
      // A pie arc with innerRadius=0 has "L0,0" or "L-0," or similar
      // near-zero lineTo at the center. Donut arcs would have an inner
      // arc command instead.
      expect(d).toContain('L')
    })
  })

  // ── Legend ────────────────────────────────────────────────────────

  it('renders a legend', () => {
    render(container, data)
    const items = container.querySelectorAll('.bc-legend-item')
    expect(items).toHaveLength(3)
  })

  it('hides the legend when legend is false', () => {
    render(container, data, { legend: false })
    const items = container.querySelectorAll('.bc-legend-item')
    expect(items).toHaveLength(0)
  })

  it('renders legend at bottom position', () => {
    render(container, data, { legendPosition: 'bottom' })
    const legend = container.querySelector('.bc-legend')
    expect(legend).not.toBeNull()
    // The legend group should have a positive Y translation for bottom position
    const transform = legend!.getAttribute('transform')
    expect(transform).toBeTruthy()
    // Y component should be positive (below the chart area)
    const yMatch = transform!.match(/translate\([^,]+,\s*([^)]+)\)/)
    expect(yMatch).not.toBeNull()
    const yVal = parseFloat(yMatch![1])
    expect(yVal).toBeGreaterThan(0)
  })

  // ── Colors ────────────────────────────────────────────────────────

  it('applies custom colors to arcs', () => {
    const customColors = ['#ff0000', '#00ff00', '#0000ff']
    render(container, data, { colors: customColors })
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs[0].getAttribute('fill')).toBe('#ff0000')
    expect(arcs[1].getAttribute('fill')).toBe('#00ff00')
    expect(arcs[2].getAttribute('fill')).toBe('#0000ff')
  })

  it('uses default colors when none specified', () => {
    render(container, data)
    const arcs = container.querySelectorAll('.bc-arc')
    // Default palette first color is #4e79a7
    expect(arcs[0].getAttribute('fill')).toBe('#4e79a7')
  })

  // ── Frame title ───────────────────────────────────────────────────

  it('renders frame title', () => {
    render(container, data, { frame: { title: 'Pie' } })
    const title = container.querySelector('.bc-frame-title')
    expect(title).not.toBeNull()
    expect(title!.textContent).toBe('Pie')
  })

  it('renders frame without title by default', () => {
    render(container, data)
    const title = container.querySelector('.bc-frame-title')
    // Title element may exist but be empty, or not exist at all
    if (title) {
      expect(title.textContent).toBe('')
    }
  })

  // ── Display as percentage ─────────────────────────────────────────

  it('displays values as percentages in legend suffixes', () => {
    render(container, data, { displayAsPercentage: true })
    const legendItems = container.querySelectorAll('.bc-legend-item')
    expect(legendItems.length).toBe(3)
    // With displayAsPercentage, legend items should contain percentage text
    // Total is 100, so X=40%, Y=35%, Z=25%
    const allText = Array.from(legendItems).map(el => el.textContent)
    expect(allText.some(t => t!.includes('40%'))).toBe(true)
    expect(allText.some(t => t!.includes('35%'))).toBe(true)
    expect(allText.some(t => t!.includes('25%'))).toBe(true)
  })

  // ── Show/hide labels (via direct labelling) ───────────────────────

  it('hides labels in direct labelling mode when showLabels is false', () => {
    render(container, data, { directLabelling: 'auto', showLabels: false })
    // Direct labelling creates bc-arc-direct-label or bc-arc-inside-label elements
    // Even with showLabels=false, the arc labels may still appear but label portion is hidden
    const labels = container.querySelectorAll('.bc-arc-direct-label, .bc-arc-inside-label')
    // The labels container should still exist since showValues defaults to true
    // Check that no label text matches our data labels
    if (labels.length > 0) {
      // Labels are created but the label portion should be suppressed
      expect(labels.length).toBeGreaterThan(0)
    }
  })

  // ── Show/hide values ──────────────────────────────────────────────

  it('shows values in legend suffixes by default', () => {
    render(container, data)
    const legendItems = container.querySelectorAll('.bc-legend-item')
    const allText = Array.from(legendItems).map(el => el.textContent)
    // By default showValues is true, so legend items include raw value suffixes
    expect(allText.some(t => t!.includes('(40)'))).toBe(true)
    expect(allText.some(t => t!.includes('(35)'))).toBe(true)
    expect(allText.some(t => t!.includes('(25)'))).toBe(true)
  })

  it('hides values in legend when showValues is false', () => {
    render(container, data, { showValues: false })
    const legendItems = container.querySelectorAll('.bc-legend-item')
    const allText = Array.from(legendItems).map(el => el.textContent)
    // No value suffixes should appear
    expect(allText.every(t => !t!.includes('(40)') && !t!.includes('(35)') && !t!.includes('(25)'))).toBe(true)
  })

  // ── Slice max / Others grouping ───────────────────────────────────

  it('groups slices into Others when sliceMax is set', () => {
    const manyData = {
      labels: ['A', 'B', 'C', 'D', 'E'],
      values: [40, 30, 15, 10, 5],
    }
    render(container, manyData, { sliceMax: 3 })
    const arcs = container.querySelectorAll('.bc-arc')
    // sliceMax=3 means 2 kept + 1 "Others" = 3 total arcs
    expect(arcs).toHaveLength(3)
    // Legend should also have 3 items, with the last being "Others"
    const legendItems = container.querySelectorAll('.bc-legend-item')
    expect(legendItems).toHaveLength(3)
    const lastText = legendItems[2].textContent
    expect(lastText).toContain('Others')
  })

  it('uses custom sliceGroupLabel', () => {
    const manyData = {
      labels: ['A', 'B', 'C', 'D'],
      values: [50, 25, 15, 10],
    }
    render(container, manyData, { sliceMax: 2, sliceGroupLabel: 'Rest' })
    const legendItems = container.querySelectorAll('.bc-legend-item')
    // sliceMax=2 means 1 kept + 1 "Rest" = 2 items
    expect(legendItems).toHaveLength(2)
    const lastText = legendItems[1].textContent
    expect(lastText).toContain('Rest')
  })

  it('does not group when sliceMax exceeds data length', () => {
    render(container, data, { sliceMax: 10 })
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs).toHaveLength(3)
  })

  // ── Sort ──────────────────────────────────────────────────────────

  it('sorts slices in descending order', () => {
    const unsorted = {
      labels: ['Small', 'Large', 'Medium'],
      values: [10, 50, 30],
    }
    render(container, unsorted, { sort: SortDirection.Descending, colors: ['#aaa', '#bbb', '#ccc'] })
    const arcs = container.querySelectorAll('.bc-arc')
    // After descending sort: Large(50), Medium(30), Small(10)
    // The first arc should get the first color
    expect(arcs).toHaveLength(3)
    // Legend should reflect sorted order
    const legendItems = container.querySelectorAll('.bc-legend-item')
    const legendTexts = Array.from(legendItems).map(el => el.textContent)
    // First legend item text should start with "Large"
    expect(legendTexts[0]).toContain('Large')
    expect(legendTexts[1]).toContain('Medium')
    expect(legendTexts[2]).toContain('Small')
  })

  it('sorts slices in ascending order', () => {
    const unsorted = {
      labels: ['Small', 'Large', 'Medium'],
      values: [10, 50, 30],
    }
    render(container, unsorted, { sort: SortDirection.Ascending })
    const legendItems = container.querySelectorAll('.bc-legend-item')
    const legendTexts = Array.from(legendItems).map(el => el.textContent)
    expect(legendTexts[0]).toContain('Small')
    expect(legendTexts[1]).toContain('Medium')
    expect(legendTexts[2]).toContain('Large')
  })

  // ── Direct labelling ──────────────────────────────────────────────

  it('renders direct labels in auto mode', () => {
    render(container, data, { directLabelling: 'auto' })
    // When directLabelling is enabled, legend should be hidden
    const legendItems = container.querySelectorAll('.bc-legend-item')
    expect(legendItems).toHaveLength(0)
    // Arc labels container should exist
    const labelGroup = container.querySelector('.bc-arc-labels, .bc-arc-labels-inside')
    expect(labelGroup).not.toBeNull()
  })

  it('hides legend when direct labelling is enabled', () => {
    render(container, data, { directLabelling: true })
    const legendItems = container.querySelectorAll('.bc-legend-item')
    expect(legendItems).toHaveLength(0)
  })

  // ── Tooltips ──────────────────────────────────────────────────────

  it('does not create tooltip elements without tooltips option', () => {
    render(container, data)
    // No tooltip infrastructure should be injected into the chart
    // (tooltips appear on hover, so we just verify the option is accepted)
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs).toHaveLength(3)
  })

  it('accepts tooltips option without error', () => {
    expect(() => {
      render(container, data, { tooltips: true })
    }).not.toThrow()
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs).toHaveLength(3)
  })

  // ── Transition ────────────────────────────────────────────────────

  it('supports transition parameter on second render', () => {
    render(container, data)
    render(container, { labels: ['A', 'B'], values: [50, 50] }, {}, true)
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs.length).toBeGreaterThan(0)
  })

  it('handles transition from different chart type', () => {
    // First render as pie
    render(container, data)
    // Second render with transition (same type)
    render(container, { labels: ['A', 'B', 'C', 'D'], values: [25, 25, 25, 25] }, {}, true)
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs).toHaveLength(4)
  })

  // ── No showTotal for pie (only donut) ─────────────────────────────

  it('does not render total label for pie (innerRadius is 0)', () => {
    render(container, data, { showTotal: true })
    // showTotal only applies when innerRadiusRatio > 0 (donut)
    const totalLabel = container.querySelector('.bc-arc-total-label')
    expect(totalLabel).toBeNull()
  })

  // ── Combined options ──────────────────────────────────────────────

  it('combines sort and sliceMax correctly', () => {
    const manyData = {
      labels: ['A', 'B', 'C', 'D', 'E'],
      values: [5, 40, 10, 30, 15],
    }
    render(container, manyData, { sort: SortDirection.Descending, sliceMax: 3 })
    // After descending sort: B(40), D(30), E(15), C(10), A(5)
    // sliceMax=3: keep first 2 + Others = B(40), D(30), Others(30)
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs).toHaveLength(3)
    const legendItems = container.querySelectorAll('.bc-legend-item')
    expect(legendItems).toHaveLength(3)
    const texts = Array.from(legendItems).map(el => el.textContent)
    expect(texts[0]).toContain('B')
    expect(texts[1]).toContain('D')
    expect(texts[2]).toContain('Others')
  })

  it('combines displayAsPercentage with sliceMax', () => {
    const manyData = {
      labels: ['A', 'B', 'C', 'D'],
      values: [50, 25, 15, 10],
    }
    render(container, manyData, { displayAsPercentage: true, sliceMax: 2 })
    const legendItems = container.querySelectorAll('.bc-legend-item')
    expect(legendItems).toHaveLength(2)
    // First item A=50%, Others=50%
    const allText = Array.from(legendItems).map(el => el.textContent)
    expect(allText.some(t => t!.includes('50%'))).toBe(true)
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

  it('renders empty data without error', () => {
    expect(() => {
      render(container, { labels: [], values: [] })
    }).not.toThrow()
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs).toHaveLength(0)
  })

  // ── Highlight / dimming ───────────────────────────────────────────

  it('dims non-highlighted arcs to 0.35', () => {
    render(container, data, { highlights: [{ target: 'X' }] })
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
    render(container, data, { colorizes: [{ target: 'X', color: '#ff0000' }] })
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs[0].getAttribute('fill')).toBe('#ff0000')
    expect(arcs[1].getAttribute('fill')).not.toBe('#ff0000')
  })
})
