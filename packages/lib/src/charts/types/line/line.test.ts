import { describe, it, expect } from 'vitest'
import { render } from './line'

const DATA = { labels: ['Jan', 'Feb', 'Mar'], values: [10, 25, 15] }

function createContainer(): HTMLElement {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return container
}

describe('line chart rendering', () => {
  it('renders a line path', () => {
    const container = createContainer()
    render(container, DATA)
    const path = container.querySelector('.bc-line')
    expect(path).not.toBeNull()
    expect(path?.getAttribute('d')).toBeTruthy()
  })

  it('renders dots for each data point', () => {
    const container = createContainer()
    render(container, DATA)
    const dots = container.querySelectorAll('.bc-dot')
    expect(dots).toHaveLength(3)
  })

  it('creates frame and SVG', () => {
    const container = createContainer()
    render(container, DATA)
    expect(container.querySelector('.bc-frame')).not.toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })
})

describe('line chart options', () => {
  it('applies custom color', () => {
    const container = createContainer()
    render(container, DATA, { colors: ['#ff0000'] })
    const path = container.querySelector('.bc-line')
    expect(path?.getAttribute('stroke')).toBe('#ff0000')
  })
})
