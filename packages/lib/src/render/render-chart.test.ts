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
    container.appendChild(document.createElement('span'))
    renderChart(container, baseDef())
    expect(container.querySelector('span')).toBeNull()
  })
})
