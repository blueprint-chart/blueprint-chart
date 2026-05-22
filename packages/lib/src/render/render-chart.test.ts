import { describe, it, expect, beforeEach } from 'vitest'
import { renderChart } from './render-chart'
import { ChartType } from '../enums'
import type { ChartDefinition } from './types'

function baseDef(overrides: Partial<ChartDefinition> = {}): ChartDefinition {
  return {
    chartType: ChartType.BarVertical,
    data: { labels: ['a', 'b', 'c'], values: [1, 2, 3] },
    options: {},
    ...overrides,
  }
}

describe('renderChart', () => {
  let container: HTMLElement
  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('renders an SVG into the container', () => {
    renderChart(container, baseDef())
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders nothing when data is empty', () => {
    renderChart(container, baseDef({ data: { labels: [], values: [] } }))
    expect(container.querySelector('svg')).toBeNull()
  })

  it('omits frame in thumbnail mode', () => {
    renderChart(container, baseDef({ frame: { title: 'Foo' } }), { thumbnail: true })
    expect(container.querySelector('.bc-frame-header')).toBeNull()
  })

  it('applies theme class to .bc-frame', () => {
    renderChart(container, baseDef({ frame: { title: 'Foo' }, theme: 'dark' }))
    expect(container.querySelector('.bc-frame')?.classList.contains('bc-theme-dark')).toBe(true)
  })

  it('clears container on non-transition render', () => {
    const sentinel = document.createElement('span')
    sentinel.id = 'sentinel'
    container.appendChild(sentinel)
    renderChart(container, baseDef())
    expect(container.querySelector('#sentinel')).toBeNull()
  })

  // S4: empty data while transition=true must still wipe stale DOM
  it('clears container on transition render with empty data', () => {
    const sentinel = document.createElement('span')
    sentinel.id = 'stale'
    container.appendChild(sentinel)
    renderChart(container, baseDef({ data: { labels: [], values: [] } }), { transition: true })
    expect(container.querySelector('#stale')).toBeNull()
  })

  // S8: stripColors must scrub colors from pre-resolved `options`, not just properties
  it('stripColors strips colors from pre-resolved options', () => {
    // Render once WITH the explicit red palette baked into options to capture
    // the "no strip" fill, then render again with stripColors=true.
    const defWithRed = baseDef({
      options: { colors: ['#ff0000'] },
    })
    renderChart(container, defWithRed)
    const withRedFill = container.querySelector('rect')?.getAttribute('fill') ?? ''
    expect(withRedFill.toLowerCase()).toBe('#ff0000')

    // Now strip — must NOT pick up the red from options.
    const container2 = document.createElement('div')
    document.body.appendChild(container2)
    renderChart(container2, defWithRed, { stripColors: true })
    const strippedFill = container2.querySelector('rect')?.getAttribute('fill') ?? ''
    expect(strippedFill.toLowerCase()).not.toBe('#ff0000')
  })
})
