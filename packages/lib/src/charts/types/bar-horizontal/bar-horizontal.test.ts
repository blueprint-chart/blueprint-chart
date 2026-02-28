import { describe, it, expect } from 'vitest'
import { render } from './bar-horizontal'

const DATA = { labels: ['A', 'B', 'C'], values: [10, 30, 20] }

function createContainer(): HTMLElement {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return container
}

describe('bar-horizontal rendering', () => {
  it('renders horizontal bars', () => {
    const container = createContainer()
    render(container, DATA)
    const bars = container.querySelectorAll('.bc-bar')
    expect(bars).toHaveLength(3)
  })

  it('creates frame and SVG', () => {
    const container = createContainer()
    render(container, DATA)
    expect(container.querySelector('.bc-frame')).not.toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })
})

describe('bar-horizontal attributes', () => {
  it('bars have horizontal orientation (width varies)', () => {
    const container = createContainer()
    render(container, DATA)
    const bars = container.querySelectorAll('.bc-bar')
    const widths = Array.from(bars).map(b => Number(b.getAttribute('width')))
    expect(widths.some(w => w > 0)).toBe(true)
    // All bars start at x=0
    const xs = Array.from(bars).map(b => Number(b.getAttribute('x')))
    expect(xs.every(x => x === 0)).toBe(true)
  })

  it('applies highlight colors', () => {
    const container = createContainer()
    render(container, DATA, { highlights: [{ target: 'A', color: '#00ff00' }] })
    const bars = container.querySelectorAll('.bc-bar')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    expect(fills).toContain('#00ff00')
  })
})
