import type { ChartDefinition } from '../types'

export interface BackendRenderOptions {
  sceneIndex?: number
  thumbnail?: boolean
  theme?: string
}

/**
 * A render backend abstracts the DOM environment. The DOM backend uses the
 * ambient document; the Node backend provisions jsdom. Both render via the
 * lib's existing renderChart/renderBpc pipeline.
 */
export interface RenderBackend {
  readonly kind: 'dom' | 'node'
  /** Create a render target. cleanup() detaches/closes it. */
  createContainer(width: number, height: number): { container: HTMLElement, cleanup: () => void }
  /** Render the resolved definition into the container (transition disabled). */
  renderToContainer(container: HTMLElement, definition: ChartDefinition, opts: BackendRenderOptions): void
  /** Serialize the chart SVG markup from a rendered container. */
  serializeSvg(container: HTMLElement): string
  /** Returns the `.bc-frame` outerHTML; falls back to the chart SVG markup when there is no frame (e.g. thumbnail mode). */
  serializeFrame(container: HTMLElement): string
  /** Rasterize SVG markup to a PNG byte array. DOM backend throws PngBrowserUnsupportedError. */
  rasterizePng(svg: string, opts: { width?: number, height?: number }): Promise<Uint8Array>
}
