import { describe, it, expect } from 'vitest'
import { render } from './pie'

const DATA = { labels: ['X', 'Y', 'Z'], values: [40, 35, 25] }

function createContainer(): HTMLElement {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return container
}

describe('pie chart rendering', () => {
  it('renders arc paths', () => {
    const container = createContainer()
    render(container, DATA)
    const arcs = container.querySelectorAll('.bc-arc')
    expect(arcs).toHaveLength(3)
  })

  it('creates frame and SVG', () => {
    const container = createContainer()
    render(container, DATA)
    expect(container.querySelector('.bc-frame')).not.toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })
})

describe('pie chart legend', () => {
  it('renders a legend', () => {
    const container = createContainer()
    render(container, DATA)
    const items = container.querySelectorAll('.bc-legend-item')
    expect(items).toHaveLength(3)
  })
})
