import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './bar-multi'

describe('bar-multi huge gap diagnostics', () => {
  let container: HTMLElement
  let rectSpy: ReturnType<typeof vi.spyOn>

  function setContainerSize(w: number, h: number) {
    rectSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      width: w, height: h, x: 0, y: 0, top: 0, left: 0, bottom: h, right: w, toJSON: () => ({}),
    })
  }

  beforeEach(() => {
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    vi.useRealTimers()
    rectSpy?.mockRestore()
  })

  it('paris-medals wrap does not leave huge gap between axis labels and chart bottom', () => {
    setContainerSize(600, 400)
    const data = {
      labels: ['USA', 'China', 'Japan', 'Great Britain', 'Australia', 'France'],
      values: [],
      series: [
        { name: 'Gold', values: [40, 38, 27, 22, 17, 16] },
        { name: 'Silver', values: [44, 32, 14, 21, 7, 20] },
        { name: 'Bronze', values: [42, 18, 17, 22, 22, 23] },
      ],
    }
    render(container, data, {
      verticalAxis: { labelPosition: 'off', gridStyle: 'none' },
      legendPosition: 'top',
      valueLabels: true,
    })
    const svg = container.querySelector('svg')!
    const svgH = Number(svg.getAttribute('height'))
    const svgW = Number(svg.getAttribute('width'))
    const chartAreaG = svg.querySelector('g')!
    const areaTransform = chartAreaG.getAttribute('transform') ?? ''
    const marginTop = Number(areaTransform.match(/translate\([\d.]+,([\d.]+)\)/)?.[1] ?? 0)
    const axisG = container.querySelector('.bc-axis-horizontal')!
    const axisTransform = axisG.getAttribute('transform') ?? ''
    const axisY = Number(axisTransform.match(/translate\([\d.]+,([\d.]+)\)/)?.[1] ?? 0)

    const absAxisY = axisY + marginTop
    const gapBelowAxis = svgH - absAxisY

    expect(svgW).toBe(600)
    expect(gapBelowAxis).toBeLessThan(60)
    expect(gapBelowAxis).toBeGreaterThan(30)
  })

  it('wrapped labels sit fully below axis baseline (no overlap with chart area)', () => {
    setContainerSize(600, 400)
    const data = {
      labels: ['USA', 'China', 'Japan', 'Great Britain', 'Australia', 'France'],
      values: [],
      series: [
        { name: 'Gold', values: [40, 38, 27, 22, 17, 16] },
      ],
    }
    render(container, data, {
      verticalAxis: { labelPosition: 'off', gridStyle: 'none' },
      legendPosition: 'top',
    })

    const wrapped = Array.from(container.querySelectorAll('.bc-axis-horizontal .tick text'))
      .find(t => t.querySelectorAll('tspan').length >= 2) as SVGTextElement
    expect(wrapped).toBeDefined()
    expect(wrapped.getAttribute('dy')).toBeNull()
    const tspans = wrapped.querySelectorAll('tspan')
    expect(tspans[0].getAttribute('dy')).toBe('0.71em')
    expect(tspans[0].getAttribute('x')).toBe('0')
    // Parent text y should be positive (below axis baseline) — d3 default is 9
    const y = Number(wrapped.getAttribute('y') ?? 0)
    expect(y).toBeGreaterThan(0)
  })

  it('after rerender, wrapped labels remain below axis baseline (no overlap)', () => {
    setContainerSize(600, 400)
    const data = {
      labels: ['USA', 'China', 'Japan', 'Great Britain', 'Australia', 'France'],
      values: [],
      series: [
        { name: 'Gold', values: [40, 38, 27, 22, 17, 16] },
      ],
    }
    render(container, data)
    render(container, data, {}, true)

    const wrapped = Array.from(container.querySelectorAll('.bc-axis-horizontal .tick text'))
      .find(t => t.querySelectorAll('tspan').length >= 2) as SVGTextElement
    expect(wrapped).toBeDefined()
    expect(wrapped.getAttribute('dy')).toBeNull()
    const tspans = wrapped.querySelectorAll('tspan')
    expect(tspans[0].getAttribute('dy')).toBe('0.71em')
  })
})
