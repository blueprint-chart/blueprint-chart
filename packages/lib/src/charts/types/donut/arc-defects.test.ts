import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { parse } from '../../../dsl/parser'
import { astToDefinition } from '../../../render/ast-to-definition'
import { renderChart } from '../../../render/render-chart'

beforeEach(() => {
  // jsdom has no layout engine; the annotation renderer measures with getBBox.
  ;(window.SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox
    = () => ({ x: 0, y: 0, width: 0, height: 0 }) as DOMRect
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

function draw(source: string): HTMLElement {
  const host = document.createElement('div')
  document.body.appendChild(host)
  renderChart(host, astToDefinition(parse(source)))
  return host
}

function arcAngles(host: HTMLElement): number {
  return host.querySelectorAll('.bc-arc').length
}

describe('#36 arc totals and legend values are formatted, not stringified', () => {
  it('does not print floating point noise in the centre total', () => {
    const host = draw(`chart donut {
  showTotal = true
  data {
    "A" = 0.1
    "B" = 0.2
  }
}`)
    const total = host.querySelector('.bc-arc-total-value')?.textContent ?? ''
    expect(total).not.toContain('0.30000000000000004')
    expect(total).toBe('0.3')
  })

  it('groups thousands in the centre total', () => {
    const host = draw(`chart donut {
  showTotal = true
  data {
    "A" = 4700000000
    "B" = 2140000000
  }
}`)
    expect(host.querySelector('.bc-arc-total-value')?.textContent).toBe('6,840,000,000')
  })
})

describe('#37 sliceMax groups the smallest slices, not the tail by input order', () => {
  it('keeps the largest slices and groups the rest', () => {
    const host = draw(`chart pie {
  sliceMax = 3
  legend = true
  data {
    "Small" = 1
    "Big" = 80
    "Mid" = 10
    "Tail A" = 5
    "Tail B" = 4
  }
}`)
    const labels = [...host.querySelectorAll('.bc-legend-item')].map(i => i.getAttribute('data-series'))
    expect(labels).toEqual(['Big', 'Mid', 'Others'])
  })
})

describe('#33 negative and zero-sum data cannot partition a circle', () => {
  it('drops a negative slice instead of overlapping the arcs', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const host = draw(`chart pie {
  data {
    "Profit" = 60
    "Loss" = -25
    "Other" = 30
  }
}`)
    expect(arcAngles(host)).toBe(2)
    expect(warn).toHaveBeenCalled()
  })

  it('gives a zero-sum pie no slice claiming the whole circle', () => {
    const host = draw(`chart pie {
  data {
    "A" = 0
    "B" = 0
  }
}`)
    // Zero-valued slices are kept (no data is dropped) but sweep nothing, so
    // none of them can read as 100%.
    expect(arcAngles(host)).toBe(2)
    const sweeps = [...host.querySelectorAll('.bc-arc')].map(a => a.getAttribute('d') ?? '')
    expect(sweeps).toEqual(sweeps.map(() => sweeps[0]))
  })
})

describe('#49 arc charts render point and range annotations', () => {
  it('renders a point annotation on a donut', () => {
    const host = draw(`chart donut {
  data {
    "Alpha" = 30
    "Beta" = 20
  }
  annotation "Alpha" {
    text = "The biggest slice"
  }
}`)
    expect(host.querySelectorAll('.bc-annotations, .bc-annotation').length).toBeGreaterThan(0)
    expect(host.textContent).toContain('The biggest slice')
  })
})

describe('#34 a slice too narrow for an inside label still gets one', () => {
  it('pushes a 4% slice outside instead of dropping its label', () => {
    const host = draw(`chart pie {
  directLabelling = "inside"
  data {
    "Huge" = 60
    "Big" = 30
    "Mid" = 6
    "Tiny" = 4
  }
}`)
    expect(host.textContent).toContain('Tiny')
  })
})

describe('#12 showTotal is not offered where it cannot render', () => {
  it('is absent from the pie option registry', async () => {
    const { getChartOptions } = await import('../../registry')
    expect(getChartOptions('pie').map(o => o.key)).not.toContain('showTotal')
  })

  it('is still offered on donut, which has a hole to draw it in', async () => {
    const { getChartOptions } = await import('../../registry')
    expect(getChartOptions('donut').map(o => o.key)).toContain('showTotal')
  })
})
