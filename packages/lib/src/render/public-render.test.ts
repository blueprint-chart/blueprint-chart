import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
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

describe('accessibility metadata on the exported SVG (#87)', () => {
  it('gives the standalone SVG a role, an accessible name and a description', async () => {
    const svg = await (await render(FRAMED_BPC)).toSvg({ width: 800, height: 500 })
    expect(svg).toMatch(/^<svg[^>]*role="img"/)
    expect(svg).toMatch(/^<svg[^>]*aria-label="Headline here"/)
    expect(svg).toContain('<title>Headline here</title>')
    expect(svg).toMatch(/<desc>Subtitle here[^<]*<\/desc>/)
  })

  it('describes the data when the chart carries no description', async () => {
    const svg = await (await render(BPC)).toSvg({ width: 800, height: 500 })
    expect(svg).toMatch(/<desc>[^<]*2 categories[^<]*<\/desc>/)
  })
})

describe('render() color scheme', () => {
  let listeners: Array<() => void>
  let matches: boolean

  function stubScheme(dark: boolean) {
    listeners = []
    matches = dark
    window.matchMedia = vi.fn(() => ({
      get matches() {
        return matches
      },
      addEventListener: (_: string, fn: () => void) => listeners.push(fn),
      removeEventListener: (_: string, fn: () => void) => listeners.splice(listeners.indexOf(fn), 1),
    }) as unknown as MediaQueryList)
  }

  function mountedEl() {
    const el = document.createElement('div')
    document.body.appendChild(el)
    return el
  }

  afterEach(() => {
    delete (window as Partial<Window>).matchMedia
  })

  it('renders dark when the reader prefers dark and no theme is set', async () => {
    stubScheme(true)
    const html = await (await render(BPC)).toHtml()
    expect(html).toContain('bc-theme-dark')
  })

  it('treats theme "auto" like no theme', async () => {
    stubScheme(true)
    const html = await (await render(BPC, { theme: 'auto' })).toHtml()
    expect(html).toContain('bc-theme-dark')
    expect(html).not.toContain('bc-theme-auto')
  })

  it('keeps an explicit theme over the reader preference', async () => {
    stubScheme(true)
    const html = await (await render(BPC, { theme: 'blueprint-framed' })).toHtml()
    expect(html).toContain('bc-theme-blueprint-framed')
    expect(html).not.toContain('bc-theme-dark')
  })

  it('mount() follows a live color scheme change', async () => {
    stubScheme(false)
    const el = document.createElement('div')
    document.body.appendChild(el)
    ;(await render(BPC)).mount(el)
    expect(el.querySelector('.bc-theme-dark')).toBeNull()
    matches = true
    listeners.forEach(fn => fn())
    expect(el.querySelector('.bc-theme-dark')).not.toBeNull()
  })
  it('mount() re-renders each element with the scene it was mounted with', async () => {
    stubScheme(false)
    const a = mountedEl()
    const b = mountedEl()
    ;(await render(BPC)).mount(a).scene(0).mount(b)
    matches = true
    listeners.forEach(fn => fn())
    expect(a.querySelector('path.bc-line')).toBeNull()
    expect(b.querySelector('path.bc-line')).not.toBeNull()
  })

  it('mount() listens once per handle and drops detached elements', async () => {
    stubScheme(false)
    const el = mountedEl()
    ;(await render(BPC)).mount(el).mount(el)
    expect(listeners).toHaveLength(1)
    el.remove()
    listeners.forEach(fn => fn())
    expect(listeners).toHaveLength(0)
  })
})

describe('render() text alternative with overlays', () => {
  it('toSvg describes overlays in the desc', async () => {
    const source = `chart bar-vertical {
  data {
    series = "Low","V","High"
    "A" = 8,10,12
    "B" = 18,20,22
  }
  overlay "Low" "High" {
    title = "Band"
  }
}`
    const chart = await render(source)
    const svg = await chart.toSvg()
    const outerDesc = svg.match(/<desc>(.*?)<\/desc>/)![1]
    expect(outerDesc).toContain('Includes Band.')
  })
})
