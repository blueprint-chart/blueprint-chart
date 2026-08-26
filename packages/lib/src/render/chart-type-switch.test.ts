import { describe, it, expect, beforeAll } from 'vitest'
import { createDomBackend } from './backends/dom-backend'
import { astToDefinition } from './ast-to-definition'
import { parse } from '../dsl/parser'

beforeAll(() => {
  ;(window.SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox
    = () => ({ x: 0, y: 0, width: 0, height: 0 }) as DOMRect
})

const BAR = 'chart bar-vertical { data { "A" = 1 "B" = 2 } }'
const LINE = 'chart line { data { "A" = 1 "B" = 2 } }'

function verticalTickLabels(src: string, into?: HTMLElement): { count: number, container: HTMLElement } {
  const backend = createDomBackend()
  const container = into ?? backend.createContainer(640, 400).container
  backend.renderToContainer(container, astToDefinition(parse(src)), {})
  return { count: container.querySelectorAll('.bc-axis-vertical .tick text').length, container }
}

describe('rendering a second chart type into the same container', () => {
  // #55: the cached AxisService kept the previous type's axis DOM, and
  // d3-axis's tick data-join reuses ticks that match by value, so the labels
  // bar-vertical had stripped never came back for line.
  it('keeps the vertical axis labels the same as a fresh container', () => {
    const { container } = verticalTickLabels(BAR)
    const reused = verticalTickLabels(LINE, container).count
    const fresh = verticalTickLabels(LINE).count

    expect(fresh).toBeGreaterThan(0)
    expect(reused).toBe(fresh)
  })
})
