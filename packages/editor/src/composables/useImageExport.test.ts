import { exportSvg, buildFrameSvgFromDom } from '@/utils/export/image'
import { useImageExport } from './useImageExport'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('exportSvg', () => {
  it('serializes the SVG and triggers a download', () => {
    const revokeObjectURL = vi.fn()
    const createObjectURL = vi.fn(() => 'blob:mock-url')
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })

    const clickSpy = vi.fn()
    vi.spyOn(document, 'createElement').mockReturnValue({
      set href(v: string) { /* noop */ },
      set download(v: string) { /* noop */ },
      click: clickSpy,
    } as unknown as HTMLAnchorElement)

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '100')

    exportSvg(svg, 'test.svg')

    expect(createObjectURL).toHaveBeenCalledOnce()
    const blob = createObjectURL.mock.calls[0][0] as Blob
    expect(blob.type).toBe('image/svg+xml;charset=utf-8')
    expect(clickSpy).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })
})

describe('useImageExport', () => {
  it('returns downloadSvg and downloadPng functions', () => {
    const containerRef = shallowRef(null)
    const { downloadSvg, downloadPng } = useImageExport(containerRef)
    expect(typeof downloadSvg).toBe('function')
    expect(typeof downloadPng).toBe('function')
  })

  it('downloadSvg does nothing when container is null', () => {
    const containerRef = shallowRef(null)
    const { downloadSvg } = useImageExport(containerRef)
    expect(() => downloadSvg()).not.toThrow()
  })

  it('downloadSvg does nothing when no SVG is found', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const containerRef = shallowRef(container)
    const { downloadSvg } = useImageExport(containerRef)
    expect(() => downloadSvg()).not.toThrow()
    container.remove()
  })
})

describe('buildFrameSvgFromDom (#69)', () => {
  function buildFrame(): HTMLElement {
    const frame = document.createElement('div')
    frame.className = 'bc-frame'
    const title = document.createElement('h3')
    title.className = 'bc-frame-title'
    title.textContent = 'Headline here'
    frame.appendChild(title)
    const body = document.createElement('div')
    body.className = 'bc-frame-body'
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('role', 'img')
    svg.setAttribute('aria-label', 'Headline here')
    const desc = document.createElementNS('http://www.w3.org/2000/svg', 'desc')
    desc.textContent = 'bar vertical chart of 2 categories.'
    svg.appendChild(desc)
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('class', 'bc-bar')
    svg.appendChild(rect)
    body.appendChild(svg)
    frame.appendChild(body)
    document.body.appendChild(frame)
    return frame
  }

  it('builds a pure-SVG frame with no foreignObject, so the canvas is never tainted', () => {
    const frame = buildFrame()
    const built = buildFrameSvgFromDom(frame)
    frame.remove()

    expect(built).not.toBeNull()
    expect(built!.markup).not.toContain('foreignObject')
    expect(built!.markup).toContain('Headline here')
    expect(built!.markup).toContain('class="bc-bar"')
  })

  it('carries the chart accessibility metadata onto the exported root', () => {
    const frame = buildFrame()
    const built = buildFrameSvgFromDom(frame)
    frame.remove()

    expect(built!.markup).toMatch(/^<svg[^>]*role="img"/)
    expect(built!.markup).toMatch(/^<svg[^>]*aria-label="Headline here"/)
    expect(built!.markup).toContain('<desc>bar vertical chart of 2 categories.</desc>')
  })
})

describe('downloadPng error surfacing (#69)', () => {
  it('reports a failed export instead of silently doing nothing', async () => {
    const container = document.createElement('div')
    const frame = document.createElement('div')
    frame.className = 'bc-frame'
    frame.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
    container.appendChild(frame)
    document.body.appendChild(container)
    vi.stubGlobal('URL', {
      createObjectURL: () => { throw new Error('object URL unavailable') },
      revokeObjectURL: vi.fn(),
    })

    const { downloadPng, error } = useImageExport(shallowRef(container))
    await downloadPng()

    expect(error.value).toBe('object URL unavailable')
    container.remove()
  })
})
