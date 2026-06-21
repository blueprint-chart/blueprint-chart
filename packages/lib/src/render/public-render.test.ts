import { describe, it, expect, beforeAll } from 'vitest'
import { render } from './public-render'
import { ChartParseError, PngBrowserUnsupportedError } from './errors'

beforeAll(() => {
  ;(window.SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox
    = () => ({ x: 0, y: 0, width: 0, height: 0 }) as DOMRect
})

const BPC = `chart bar-vertical {
  title = "Hello"
  data { "a" = 1 "b" = 2 }
  scene { type = line }
}`

describe('render() front door (DOM env)', () => {
  it('returns a handle whose toSvg() yields SVG markup', async () => {
    const chart = await render(BPC)
    const svg = await chart.toSvg()
    expect(svg).toMatch(/^<svg/)
  })

  it('supports destructured methods sharing state', async () => {
    const { scene, toSvg } = await render(BPC)
    scene(0)
    const svg = await toSvg()
    expect(svg).toContain('path') // scene 0 switches bar→line
  })

  it('is chainable', async () => {
    const chart = await render(BPC)
    const svg = await chart.scene(0).toSvg()
    expect(svg).toContain('path')
  })

  it('mount() renders into a provided element and returns the handle', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const chart = await render(BPC)
    const ret = chart.mount(el)
    expect(ret).toBe(chart)
    expect(el.querySelector('svg')).not.toBeNull()
  })

  it('rejects invalid source with ChartParseError', async () => {
    await expect(render('not a chart {')).rejects.toBeInstanceOf(ChartParseError)
  })

  it('toPng() throws PngBrowserUnsupportedError in a DOM env', async () => {
    const chart = await render(BPC)
    await expect(chart.toPng()).rejects.toBeInstanceOf(PngBrowserUnsupportedError)
  })

  it('toHtml() returns a string containing bc-frame', async () => {
    const html = await (await render(BPC)).toHtml()
    expect(typeof html).toBe('string')
    expect(html).toContain('bc-frame')
  })
})
