import { describe, it, expect, beforeEach } from 'vitest'
import { render } from './line'

describe('line chart', () => {
  let container: HTMLElement

  const data = {
    labels: ['Jan', 'Feb', 'Mar'],
    values: [10, 25, 15],
  }

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('renders a line path', () => {
    render(container, data)
    const path = container.querySelector('.bc-line')
    expect(path).not.toBeNull()
    expect(path?.getAttribute('d')).toBeTruthy()
  })

  it('renders dots for each data point', () => {
    render(container, data)
    const dots = container.querySelectorAll('.bc-dot')
    expect(dots).toHaveLength(3)
  })

  it('creates frame and SVG', () => {
    render(container, data)
    expect(container.querySelector('.bc-frame')).not.toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('applies custom color', () => {
    render(container, data, { colors: ['#ff0000'] })
    const path = container.querySelector('.bc-line')
    expect(path?.getAttribute('stroke')).toBe('#ff0000')
  })
})
