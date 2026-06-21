import { describe, it, expect } from 'vitest'
import { createNodeBackend } from './node-backend'
import { astToDefinition } from '../ast-to-definition'
import { parse } from '../../dsl/parser'

const BPC = `chart bar-vertical {
  title = "T"
  data { "a" = 1 "b" = 2 }
}`

describe('node backend', () => {
  it('renders a BPC definition to non-empty SVG', () => {
    const backend = createNodeBackend()
    const def = astToDefinition(parse(BPC))
    const { container, cleanup } = backend.createContainer(640, 400)
    backend.renderToContainer(container, def, { thumbnail: false })
    const svg = backend.serializeSvg(container)
    cleanup()
    expect(svg).toMatch(/^<svg/)
    expect(svg.length).toBeGreaterThan(100)
  })

  it('rasterizes SVG to PNG bytes', async () => {
    const backend = createNodeBackend()
    const def = astToDefinition(parse(BPC))
    const { container, cleanup } = backend.createContainer(640, 400)
    backend.renderToContainer(container, def, { thumbnail: false })
    const svg = backend.serializeSvg(container)
    cleanup()
    const png = await backend.rasterizePng(svg, { width: 320 })
    // PNG magic number: 89 50 4E 47
    expect(png[0]).toBe(0x89)
    expect(png[1]).toBe(0x50)
    expect(png[2]).toBe(0x4e)
    expect(png[3]).toBe(0x47)
  })
})
