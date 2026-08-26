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

describe('requested output size (#7)', () => {
  it('sizes a frameless toSvg() to the requested width and height', async () => {
    const chart = await render(BPC, { frame: false })
    const svg = await chart.toSvg({ width: 1200, height: 300 })
    expect(svg).toMatch(/<svg[^>]*width="1200"/)
    expect(svg).toMatch(/<svg[^>]*height="300"/)
  })

  it('lays the plot out at the requested size rather than scaling 600x400 up', async () => {
    const wide = await (await render(BPC, { frame: false })).toSvg({ width: 1200, height: 300 })
    const tall = await (await render(BPC, { frame: false })).toSvg({ width: 400, height: 800 })
    expect(wide).toMatch(/<svg[^>]*width="1200"/)
    expect(tall).toMatch(/<svg[^>]*width="400"/)
    expect(tall).toMatch(/<svg[^>]*height="800"/)
  })
})

const FRAMED_BPC = `chart bar-vertical {
  title = "Headline here"
  description = "Subtitle here"
  byline = "By Someone"
  note = "A note"
  source = "Some Source"
  data { "a" = 1 "b" = 2 }
}`

describe('frame chrome in toSvg() (#9)', () => {
  it('carries the headline, description, byline, note and source', async () => {
    const svg = await (await render(FRAMED_BPC)).toSvg({ width: 800, height: 500 })
    expect(svg).toContain('Headline here')
    expect(svg).toContain('Subtitle here')
    expect(svg).toContain('By Someone')
    expect(svg).toContain('A note')
    expect(svg).toContain('Some Source')
  })

  it('keeps the framed output at the requested size', async () => {
    const svg = await (await render(FRAMED_BPC)).toSvg({ width: 800, height: 500 })
    expect(svg).toMatch(/^<svg[^>]*width="800"/)
    expect(svg).toMatch(/^<svg[^>]*height="500"/)
  })

  it('renders the plot inside the frame, below the header', async () => {
    const svg = await (await render(FRAMED_BPC)).toSvg({ width: 800, height: 500 })
    expect(svg).toContain('class="bc-bar"')
    expect(svg).toMatch(/<g transform="translate\(\d+(\.\d+)?,\d+(\.\d+)?\)">\s*<svg/)
  })

  it('leaves frame: false emitting the bare plot', async () => {
    const svg = await (await render(FRAMED_BPC, { frame: false })).toSvg({ width: 800, height: 500 })
    expect(svg).not.toContain('Headline here')
  })
})

const LEGEND_BPC = `chart line-multi {
  title = "Headline here"
  legend = true
  data {
    series = "X","Y"
    "a" = 1, 4
    "b" = 2, 5
  }
}`

describe('theme reaches the rasterised output (#65)', () => {
  it('paints the dark canvas background into the SVG', async () => {
    const light = await (await render(FRAMED_BPC)).toSvg({ width: 800, height: 500 })
    const dark = await (await render(FRAMED_BPC, { theme: 'dark' })).toSvg({ width: 800, height: 500 })
    expect(light).toContain('fill="#ffffff"')
    expect(dark).toContain('fill="#1c1c1c"')
    expect(dark).not.toContain('fill="#ffffff"')
  })

  it('resolves the dark surface for the chart body, not just the frame', async () => {
    const dark = await (await render(FRAMED_BPC, { theme: 'dark' })).toSvg({ width: 800, height: 500 })
    expect(dark).toMatch(/<svg[^>]*color="rgba\(255, 255, 255, 0\.9\)"/)
  })

  it('themes the legend labels, which read the text colour off the surface', async () => {
    const legendLabelFill = (svg: string) => svg.match(/<text[^>]*fill="([^"]*)">X<\/text>/)?.[1]
    const light = await (await render(LEGEND_BPC)).toSvg({ width: 800, height: 500 })
    const dark = await (await render(LEGEND_BPC, { theme: 'dark' })).toSvg({ width: 800, height: 500 })
    expect(legendLabelFill(light)).toBe('#333333')
    expect(legendLabelFill(dark)).toBe('rgba(255, 255, 255, 0.9)')
  })
})
