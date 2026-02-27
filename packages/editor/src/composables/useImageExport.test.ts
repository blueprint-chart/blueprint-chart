import { describe, it, expect, vi, afterEach } from 'vitest'
import { shallowRef } from 'vue'
import { exportSvg, useImageExport } from './useImageExport'

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
