import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from './bar-horizontal'

describe('bar-horizontal', () => {
  let container: HTMLElement

  const data = {
    labels: ['A', 'B', 'C'],
    values: [10, 30, 20],
  }

  beforeEach(() => {
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders horizontal bars', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar')
    expect(bars).toHaveLength(3)
  })

  it('creates frame and SVG', () => {
    render(container, data)
    expect(container.querySelector('.bc-frame')).not.toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('bars have horizontal orientation (width varies)', () => {
    render(container, data)
    const bars = container.querySelectorAll('.bc-bar')
    const widths = Array.from(bars).map(b => Number(b.getAttribute('width')))
    expect(widths.some(w => w > 0)).toBe(true)
    // All bars start at x=0
    const xs = Array.from(bars).map(b => Number(b.getAttribute('x')))
    expect(xs.every(x => x === 0)).toBe(true)
  })

  it('applies highlight colors', () => {
    render(container, data, {
      highlights: [{ target: 'A', color: '#00ff00' }],
    })
    const bars = container.querySelectorAll('.bc-bar')
    const fills = Array.from(bars).map(b => b.getAttribute('fill'))
    expect(fills).toContain('#00ff00')
  })

  it('supports transition parameter on second render', () => {
    render(container, data)
    render(container, { labels: ['A', 'B'], values: [15, 25] }, {}, true)
    const bars = container.querySelectorAll('.bc-bar')
    expect(bars.length).toBeGreaterThanOrEqual(2)
  })

  it('clips bars to the chart area', () => {
    render(container, data)
    const clipPath = container.querySelector('clipPath')
    expect(clipPath).not.toBeNull()
    const barGroup = clipPath!.id
      ? container.querySelector(`[clip-path="url(#${clipPath!.id})"]`)
      : null
    expect(barGroup).not.toBeNull()
    expect(barGroup!.querySelector('.bc-bar')).not.toBeNull()
  })

  it('shows horizontal axis tick labels by default', () => {
    render(container, data)
    const hAxis = container.querySelector('.bc-axis-horizontal')
    expect(hAxis).not.toBeNull()
    const tickTexts = hAxis!.querySelectorAll('.tick text')
    expect(tickTexts.length).toBeGreaterThan(0)
  })

  it('hides horizontal axis tick labels when showAxis is false', () => {
    render(container, data, {
      horizontalAxis: { showAxis: false },
    })
    const hAxis = container.querySelector('.bc-axis-horizontal')
    expect(hAxis).not.toBeNull()
    const tickTexts = hAxis!.querySelectorAll('.tick text')
    expect(tickTexts).toHaveLength(0)
  })

  it('hides horizontal axis domain line when showAxis is false', () => {
    render(container, data, {
      horizontalAxis: { showAxis: false },
    })
    const hAxis = container.querySelector('.bc-axis-horizontal')
    expect(hAxis).not.toBeNull()
    const domain = hAxis!.querySelector('.domain')
    expect(domain).toBeNull()
  })
})
