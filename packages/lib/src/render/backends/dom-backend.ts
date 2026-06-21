import type { RenderBackend, BackendRenderOptions } from './types'
import type { ChartDefinition } from '../types'
import { renderChart } from '../render-chart'
import { PngBrowserUnsupportedError } from '../errors'

export function createDomBackend(): RenderBackend {
  return {
    kind: 'dom',
    createContainer(width: number, height: number) {
      const container = document.createElement('div')
      container.style.cssText = `position:absolute;left:-99999px;top:0;width:${width}px;height:${height}px`
      document.body.appendChild(container)
      return { container, cleanup: () => container.remove() }
    },
    renderToContainer(container: HTMLElement, definition: ChartDefinition, opts: BackendRenderOptions) {
      renderChart(container, definition, {
        sceneIndex: opts.sceneIndex,
        thumbnail: opts.thumbnail ?? false,
        transition: false,
        theme: opts.theme,
      })
    },
    serializeSvg(container: HTMLElement): string {
      const frameBody = container.querySelector('.bc-frame-body')
      const svg = (frameBody ? frameBody.querySelector('svg') : container.querySelector('svg'))
      const markup = svg?.outerHTML ?? ''
      if (!markup) throw new Error('dom-backend: renderToContainer produced no SVG')
      return markup.includes('xmlns="http://www.w3.org/2000/svg"')
        ? markup
        : markup.replace(/^<svg(?=\s|>)/, '<svg xmlns="http://www.w3.org/2000/svg"')
    },
    rasterizePng(): Promise<Uint8Array> {
      return Promise.reject(new PngBrowserUnsupportedError())
    },
  }
}
