import { describe, it, expect, beforeAll } from 'vitest'
import { createDomBackend } from './dom-backend'
import { astToDefinition } from '../ast-to-definition'
import { parse } from '../../dsl/parser'
import { PngBrowserUnsupportedError } from '../errors'

beforeAll(() => {
  ;(window.SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox
    = () => ({ x: 0, y: 0, width: 0, height: 0 }) as DOMRect
})

const BPC = `chart bar-vertical { data { "a" = 1 "b" = 2 } }`

describe('dom backend', () => {
  it('renders a definition to SVG markup', () => {
    const backend = createDomBackend()
    const def = astToDefinition(parse(BPC))
    const { container, cleanup } = backend.createContainer(640, 400)
    backend.renderToContainer(container, def, {})
    const svg = backend.serializeSvg(container)
    cleanup()
    expect(svg).toMatch(/^<svg/)
  })

  it('rejects PNG rasterization', async () => {
    const backend = createDomBackend()
    await expect(backend.rasterizePng('<svg/>', {})).rejects.toBeInstanceOf(PngBrowserUnsupportedError)
  })
})
