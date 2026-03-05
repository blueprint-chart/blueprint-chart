import { describe, it, expect, beforeEach } from 'vitest'
import { render } from './line-multi'

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

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('renders one line per series', () => {
    render(container, data)
    const lines = container.querySelectorAll('.bc-line')
    expect(lines).toHaveLength(2)
  })

  it('renders a legend', () => {
    render(container, data)
    const items = container.querySelectorAll('.bc-legend-item')
    expect(items).toHaveLength(2)
  })

  it('uses different colors for each series', () => {
    render(container, data)
    const lines = container.querySelectorAll('.bc-line')
    const strokes = Array.from(lines).map(l => l.getAttribute('stroke'))
    expect(strokes[0]).not.toBe(strokes[1])
  })

  it('creates frame and SVG', () => {
    render(container, data)
    expect(container.querySelector('.bc-frame')).not.toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })

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
})
