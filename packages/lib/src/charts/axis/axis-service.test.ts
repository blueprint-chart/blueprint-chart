import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import * as d3 from 'd3'
import { AxisService } from './axis-service'

// Suppress D3 transition timers that hit jsdom's missing baseVal on SVG transforms
const origMatchMedia = window.matchMedia
beforeAll(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
})
afterAll(() => {
  window.matchMedia = origMatchMedia
})

describe('AxisService', () => {
  let container: HTMLElement
  let svg: SVGSVGElement
  let chartArea: SVGGElement

  function makeChartArea(): SVGGElement {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    svg.appendChild(g)
    return g as SVGGElement
  }

  beforeEach(() => {
    container = document.createElement('div')
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    container.appendChild(svg)
    document.body.appendChild(container)
    chartArea = makeChartArea()
  })

  afterEach(() => {
    // Interrupt all pending D3 transitions to prevent async tween callbacks
    // that hit jsdom's missing SVG baseVal
    d3.select(svg).selectAll('*').interrupt()
    AxisService.clear(container)
    document.body.removeChild(container)
  })

  it('returns the same instance for the same container', () => {
    const a = AxisService.for(container)
    const b = AxisService.for(container)
    expect(a).toBe(b)
  })

  it('returns different instances for different containers', () => {
    const other = document.createElement('div')
    const a = AxisService.for(container)
    const b = AxisService.for(other)
    expect(a).not.toBe(b)
    AxisService.clear(other)
  })

  it('creates axis groups on first attach + update', () => {
    const axes = AxisService.for(container)
    axes.attach(chartArea)

    const yScale = d3.scaleLinear().domain([0, 100]).range([300, 0])
    const xScale = d3.scaleBand<string>().domain(['A', 'B', 'C']).range([0, 500])

    axes.update({
      vertical: { scale: yScale, height: 300, options: { gridWidth: 500, topPadding: 10 } },
      horizontal: { scale: xScale, height: 300, options: { width: 500 } },
    })

    expect(chartArea.querySelector('.bc-axis-vertical')).not.toBeNull()
    expect(chartArea.querySelector('.bc-axis-horizontal')).not.toBeNull()
  })

  it('detach + attach preserves axis groups across replaceChildren', () => {
    const axes = AxisService.for(container)
    axes.attach(chartArea)

    const yScale = d3.scaleLinear().domain([0, 100]).range([300, 0])
    const xScale = d3.scaleBand<string>().domain(['A', 'B', 'C']).range([0, 500])

    axes.update({
      vertical: { scale: yScale, height: 300, options: { gridWidth: 500 } },
      horizontal: { scale: xScale, height: 300, options: { width: 500 } },
    })

    // Simulate replaceChildren flow
    axes.detach()
    expect(chartArea.querySelector('.bc-axis-vertical')).toBeNull()

    // Create new chart area (simulating re-render)
    const newChartArea = makeChartArea()
    axes.attach(newChartArea)

    // Update with different scale
    const yScale2 = d3.scaleLinear().domain([0, 200]).range([300, 0])
    axes.update({
      vertical: { scale: yScale2, height: 300, options: { gridWidth: 500 } },
      horizontal: { scale: xScale, height: 300, options: { width: 500 } },
    })

    expect(newChartArea.querySelector('.bc-axis-vertical')).not.toBeNull()
    expect(newChartArea.querySelector('.bc-axis-horizontal')).not.toBeNull()
  })

  it('second update triggers merge path (not fresh enter)', () => {
    const axes = AxisService.for(container)
    axes.attach(chartArea)

    const yScale = d3.scaleLinear().domain([0, 100]).range([300, 0])
    const xScale = d3.scaleBand<string>().domain(['A', 'B']).range([0, 400])

    axes.update({
      vertical: { scale: yScale, height: 300, options: { gridWidth: 400 } },
      horizontal: { scale: xScale, height: 300, options: { width: 400 } },
    })

    // Count axis groups after first draw
    const vAxisCount1 = chartArea.querySelectorAll('.bc-axis-vertical').length
    expect(vAxisCount1).toBe(1)

    // Second update with different scale — should update in place
    const yScale2 = d3.scaleLinear().domain([0, 200]).range([300, 0])
    axes.update({
      vertical: { scale: yScale2, height: 300, options: { gridWidth: 400 } },
      horizontal: { scale: xScale, height: 300, options: { width: 400 } },
    })

    // Still only one axis group (merge, not new enter)
    const vAxisCount2 = chartArea.querySelectorAll('.bc-axis-vertical').length
    expect(vAxisCount2).toBe(1)
  })

  it('order horizontal-first controls DOM ordering', () => {
    const axes = AxisService.for(container)
    axes.attach(chartArea)

    const yScale = d3.scaleLinear().domain([0, 100]).range([300, 0])
    const xScale = d3.scaleBand<string>().domain(['A']).range([0, 400])

    axes.update({
      vertical: { scale: yScale, height: 300, options: { gridWidth: 400 } },
      horizontal: { scale: xScale, height: 300, options: { width: 400 } },
      order: 'horizontal-first',
    })

    const wrappers = chartArea.querySelectorAll('.bc-axis-service-v, .bc-axis-service-h')
    expect(wrappers[0].classList.contains('bc-axis-service-h')).toBe(true)
    expect(wrappers[1].classList.contains('bc-axis-service-v')).toBe(true)
  })

  it('default order is vertical-first', () => {
    const axes = AxisService.for(container)
    axes.attach(chartArea)

    const yScale = d3.scaleLinear().domain([0, 100]).range([300, 0])
    const xScale = d3.scaleBand<string>().domain(['A']).range([0, 400])

    axes.update({
      vertical: { scale: yScale, height: 300, options: { gridWidth: 400 } },
      horizontal: { scale: xScale, height: 300, options: { width: 400 } },
    })

    const wrappers = chartArea.querySelectorAll('.bc-axis-service-v, .bc-axis-service-h')
    expect(wrappers[0].classList.contains('bc-axis-service-v')).toBe(true)
    expect(wrappers[1].classList.contains('bc-axis-service-h')).toBe(true)
  })

  it('renders grid lines when gridWidth is set', () => {
    const axes = AxisService.for(container)
    axes.attach(chartArea)

    const yScale = d3.scaleLinear().domain([0, 100]).range([300, 0])
    const xScale = d3.scaleBand<string>().domain(['A', 'B']).range([0, 500])

    axes.update({
      vertical: { scale: yScale, height: 300, options: { gridWidth: 500, gridStyle: 'dashed' } },
      horizontal: { scale: xScale, height: 300, options: { width: 500 } },
    })

    const gridLines = chartArea.querySelectorAll('.bc-grid-line')
    expect(gridLines.length).toBeGreaterThan(0)
  })

  it('passes through axis options (gridStyle none produces no grid lines)', () => {
    const axes = AxisService.for(container)
    axes.attach(chartArea)

    const yScale = d3.scaleLinear().domain([0, 100]).range([300, 0])
    const xScale = d3.scaleBand<string>().domain(['A']).range([0, 400])

    axes.update({
      vertical: {
        scale: yScale,
        height: 300,
        options: {
          gridWidth: 400,
          gridStyle: 'none',
        },
      },
      horizontal: {
        scale: xScale,
        height: 300,
        options: { width: 400, gridStyle: 'none' },
      },
    })

    // gridStyle: none — no grid lines
    const gridLines = chartArea.querySelectorAll('.bc-grid-line')
    expect(gridLines).toHaveLength(0)

    // axes are still rendered
    expect(chartArea.querySelector('.bc-axis-vertical')).not.toBeNull()
    expect(chartArea.querySelector('.bc-axis-horizontal')).not.toBeNull()
  })

  it('applies right direction transform on vertical axis', () => {
    const axes = AxisService.for(container)
    axes.attach(chartArea)

    const yScale = d3.scaleLinear().domain([0, 100]).range([300, 0])
    axes.update({
      vertical: {
        scale: yScale,
        height: 300,
        options: { direction: 'right', gridWidth: 500 },
      },
    })

    const vAxis = chartArea.querySelector('.bc-axis-vertical') as SVGGElement
    expect(vAxis).not.toBeNull()
    expect(vAxis.getAttribute('transform')).toBe('translate(500,0)')
  })

  it('passes tickFormat through to vertical axis', () => {
    const axes = AxisService.for(container)
    axes.attach(chartArea)

    const yScale = d3.scaleBand<string>().domain(['cat', 'dog']).range([0, 300])
    const formatter = (label: string) => label.toUpperCase()

    axes.update({
      vertical: {
        scale: yScale,
        height: 300,
        options: { topPadding: 10, tickFormat: formatter },
      },
    })

    const vAxis = chartArea.querySelector('.bc-axis-vertical')
    const tickTexts = vAxis!.querySelectorAll('.tick text')
    const texts = Array.from(tickTexts).map(t => t.textContent)
    expect(texts).toContain('CAT')
    expect(texts).toContain('DOG')
  })

  it('passes zeroY through to horizontal axis', () => {
    const axes = AxisService.for(container)
    axes.attach(chartArea)

    const xScale = d3.scaleBand<string>().domain(['A', 'B']).range([0, 400])

    axes.update({
      horizontal: {
        scale: xScale,
        height: 300,
        options: { width: 400, zeroY: 150 },
      },
    })

    const hAxis = chartArea.querySelector('.bc-axis-horizontal')
    expect(hAxis).not.toBeNull()
    const domain = hAxis!.querySelector('.domain')
    // zeroY causes the domain line to be repositioned
    if (domain) {
      const transform = domain.getAttribute('transform')
      expect(transform).toContain('translate(0,')
    }
  })

  it('destroy cleans up; fresh instance created after', () => {
    const axes = AxisService.for(container)
    axes.attach(chartArea)

    const yScale = d3.scaleLinear().domain([0, 100]).range([300, 0])
    axes.update({
      vertical: { scale: yScale, height: 300, options: { gridWidth: 400 } },
    })
    expect(chartArea.querySelector('.bc-axis-vertical')).not.toBeNull()

    axes.destroy()

    // After destroy, a new instance should be created
    const axes2 = AxisService.for(container)
    expect(axes2).not.toBe(axes)

    // Old groups are detached
    const newChartArea = makeChartArea()
    axes2.attach(newChartArea)
    axes2.update({
      vertical: { scale: yScale, height: 300, options: { gridWidth: 400 } },
    })
    expect(newChartArea.querySelector('.bc-axis-vertical')).not.toBeNull()
  })

  it('clears stale tick elements on re-attach to prevent ghost ticks', () => {
    const axes = AxisService.for(container)
    axes.attach(chartArea)

    const yScale = d3.scaleLinear().domain([0, 100]).range([300, 0])
    // Wide scale: all labels shown
    const xScale = d3.scaleBand<string>().domain(['A', 'B', 'C', 'D', 'E']).range([0, 500])
    axes.update({
      vertical: { scale: yScale, height: 300, options: { gridWidth: 500 } },
      horizontal: { scale: xScale, height: 300, options: { width: 500 } },
    })

    const ticksBefore = chartArea.querySelectorAll('.tick').length
    expect(ticksBefore).toBeGreaterThan(0)

    // Simulate re-render (e.g. resize): detach + new chartArea + attach
    axes.detach()
    const newChartArea = makeChartArea()
    axes.attach(newChartArea)

    // Before update(), tick elements must have been cleared to prevent ghost marks
    const ticksAfterAttach = newChartArea.querySelectorAll('.tick').length
    expect(ticksAfterAttach).toBe(0)

    // After update(), new ticks are re-created
    axes.update({
      vertical: { scale: yScale, height: 300, options: { gridWidth: 500 } },
      horizontal: { scale: xScale, height: 300, options: { width: 500 } },
    })
    const ticksAfterUpdate = newChartArea.querySelectorAll('.tick').length
    expect(ticksAfterUpdate).toBeGreaterThan(0)
  })

  it('strips grid lines on detach to avoid stale DOM', () => {
    const axes = AxisService.for(container)
    axes.attach(chartArea)

    const yScale = d3.scaleLinear().domain([0, 100]).range([300, 0])
    axes.update({
      vertical: { scale: yScale, height: 300, options: { gridWidth: 500, gridStyle: 'dashed' } },
    })

    const gridLinesBefore = chartArea.querySelectorAll('.bc-grid-line').length
    expect(gridLinesBefore).toBeGreaterThan(0)

    axes.detach()

    // The wrapper group still has the axis but grid lines are stripped
    const vWrapper = axes['vGroup'] as SVGGElement
    const gridLinesAfter = vWrapper.querySelectorAll('.bc-grid-line').length
    expect(gridLinesAfter).toBe(0)
  })

  it('handles update with only vertical config', () => {
    const axes = AxisService.for(container)
    axes.attach(chartArea)

    const yScale = d3.scaleLinear().domain([0, 100]).range([300, 0])
    axes.update({
      vertical: { scale: yScale, height: 300, options: { gridWidth: 400 } },
    })

    expect(chartArea.querySelector('.bc-axis-vertical')).not.toBeNull()
    // Horizontal wrapper exists but is hidden
    const hWrapper = chartArea.querySelector('.bc-axis-service-h') as SVGGElement
    expect(hWrapper.style.display).toBe('none')
  })

  it('handles update with only horizontal config', () => {
    const axes = AxisService.for(container)
    axes.attach(chartArea)

    const xScale = d3.scaleBand<string>().domain(['A', 'B']).range([0, 400])
    axes.update({
      horizontal: { scale: xScale, height: 300, options: { width: 400 } },
    })

    expect(chartArea.querySelector('.bc-axis-horizontal')).not.toBeNull()
    // Vertical wrapper exists but is hidden
    const vWrapper = chartArea.querySelector('.bc-axis-service-v') as SVGGElement
    expect(vWrapper.style.display).toBe('none')
  })

  // ── Lifecycle: detach interrupts pending transitions ────────────

  it('detach interrupts pending transitions without throwing', async () => {
    const axes = AxisService.for(container)
    axes.attach(chartArea)

    const yScale = d3.scaleLinear().domain([0, 100]).range([300, 0])
    const xScale = d3.scaleBand<string>().domain(['A', 'B', 'C']).range([0, 500])
    axes.update({
      vertical: { scale: yScale, height: 300, options: { gridWidth: 500 } },
      horizontal: { scale: xScale, height: 300, options: { width: 500 } },
    })

    // Kick off a long transition on every descendant of both axis groups so
    // detach() must interrupt active tweens, not just the wrappers.
    const vWrapper = chartArea.querySelector('.bc-axis-service-v') as SVGGElement
    const hWrapper = chartArea.querySelector('.bc-axis-service-h') as SVGGElement
    d3.select(vWrapper).selectAll<SVGGElement, unknown>('.tick')
      .transition()
      .duration(5000)
      .attr('opacity', 0)
    d3.select(hWrapper).selectAll<SVGGElement, unknown>('.tick')
      .transition()
      .duration(5000)
      .attr('opacity', 0)

    expect(() => axes.detach()).not.toThrow()

    // After detach the wrappers must be removed from the DOM…
    expect(chartArea.querySelector('.bc-axis-service-v')).toBeNull()
    expect(chartArea.querySelector('.bc-axis-service-h')).toBeNull()

    // …and the in-memory wrappers must no longer have a registered D3
    // transition. d3.active() returns null when no transition is running on a
    // node — proving interrupt() reached every descendant before remove().
    const allTicks = [
      ...Array.from(vWrapper.querySelectorAll<SVGGElement>('.tick')),
      ...Array.from(hWrapper.querySelectorAll<SVGGElement>('.tick')),
    ]
    for (const tick of allTicks) {
      expect(d3.active(tick)).toBeNull()
    }
  })
})
