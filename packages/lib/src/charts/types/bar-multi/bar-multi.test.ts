import { describe, it, expect } from 'vitest'
import { render } from './bar-multi'

const DATA = {
  labels: ['Q1', 'Q2'],
  values: [],
  series: [
    { name: 'Product A', values: [10, 20] },
    { name: 'Product B', values: [15, 25] },
  ],
}

function createContainer(): HTMLElement {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return container
}

describe('bar-multi rendering', () => {
  it('renders grouped bars', () => {
    const container = createContainer()
    render(container, DATA)
    const bars = container.querySelectorAll('.bc-bar-multi')
    // 2 labels x 2 series = 4 bars
    expect(bars).toHaveLength(4)
  })

  it('creates frame and SVG', () => {
    const container = createContainer()
    render(container, DATA)
    expect(container.querySelector('.bc-frame')).not.toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })
})

describe('bar-multi legend', () => {
  it('renders a legend by default', () => {
    const container = createContainer()
    render(container, DATA)
    const legend = container.querySelector('.bc-legend')
    expect(legend).not.toBeNull()
    const items = container.querySelectorAll('.bc-legend-item')
    expect(items).toHaveLength(2)
  })

  it('hides legend when legend option is false', () => {
    const container = createContainer()
    render(container, DATA, { legend: false })
    const legend = container.querySelector('.bc-legend')
    expect(legend).toBeNull()
  })
})
