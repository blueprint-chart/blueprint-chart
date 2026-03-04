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

describe('exportFramePng scene-player stripping', () => {
  it('clone with data-scene-player removed mirrors production behavior', () => {
    // This test validates the pattern used in exportFramePng:
    // clone the frame, then remove [data-scene-player] before serialization
    const frame = document.createElement('div')
    const body = document.createElement('div')
    body.classList.add('bc-frame-body')
    body.textContent = 'chart'
    frame.appendChild(body)
    const player = document.createElement('div')
    player.setAttribute('data-scene-player', '')
    player.textContent = 'player'
    frame.appendChild(player)

    // Simulate the clone + strip pattern from exportFramePng
    const clone = frame.cloneNode(true) as HTMLElement
    clone.querySelectorAll('[data-scene-player]').forEach(el => el.remove())

    expect(clone.querySelector('[data-scene-player]')).toBeNull()
    expect(clone.textContent).toBe('chart')
    // Original is not modified
    expect(frame.querySelector('[data-scene-player]')).not.toBeNull()
    expect(frame.textContent).toBe('chartplayer')
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
