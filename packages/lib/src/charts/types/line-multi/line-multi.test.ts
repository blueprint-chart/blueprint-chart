import { describe, it, expect } from 'vitest'
import { render } from './line-multi'

const DATA = {
  labels: ['Jan', 'Feb', 'Mar'],
  values: [],
  series: [
    { name: 'Series A', values: [10, 25, 15] },
    { name: 'Series B', values: [5, 20, 30] },
  ],
}

function createContainer(): HTMLElement {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return container
}

describe('line-multi rendering', () => {
  it('renders one line per series', () => {
    const container = createContainer()
    render(container, DATA)
    const lines = container.querySelectorAll('.bc-line')
    expect(lines).toHaveLength(2)
  })

  it('creates frame and SVG', () => {
    const container = createContainer()
    render(container, DATA)
    expect(container.querySelector('.bc-frame')).not.toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })
})

describe('line-multi styling', () => {
  it('renders a legend', () => {
    const container = createContainer()
    render(container, DATA)
    const items = container.querySelectorAll('.bc-legend-item')
    expect(items).toHaveLength(2)
  })

  it('uses different colors for each series', () => {
    const container = createContainer()
    render(container, DATA)
    const lines = container.querySelectorAll('.bc-line')
    const strokes = Array.from(lines).map(l => l.getAttribute('stroke'))
    expect(strokes[0]).not.toBe(strokes[1])
  })
})
