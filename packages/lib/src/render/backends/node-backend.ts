import type { DOMWindow } from 'jsdom'
import type { RenderBackend, BackendRenderOptions } from './types'
import type { ChartDefinition } from '../types'
import { renderChart } from '../render-chart'
import { createJsdomEnv } from './jsdom-env'
import { installTextShim } from './text-shim'
import { rasterizeToPng } from './rasterize'
import { MissingNodeRenderDepsError } from '../errors'

const FORWARDED_GLOBALS = ['window', 'document', 'Element', 'getComputedStyle', 'requestAnimationFrame'] as const
type ForwardedKey = (typeof FORWARDED_GLOBALS)[number]
type GlobalsBag = Record<ForwardedKey, unknown>

// jsdom env is created lazily per container; we stash window + serialize on the
// container via a WeakMap so serializeSvg() can read them back without re-deriving.
interface EnvRef { window: DOMWindow, serializeSvg: () => string, serializeFrame: () => string | undefined, cleanup: () => void }
const ENVS = new WeakMap<HTMLElement, EnvRef>()

function ensureSvgNamespace(svg: string): string {
  if (svg.includes('xmlns="http://www.w3.org/2000/svg"')) return svg
  return svg.replace(/^<svg(?=\s|>)/, '<svg xmlns="http://www.w3.org/2000/svg"')
}

export function createNodeBackend(): RenderBackend {
  return {
    kind: 'node',
    createContainer(width: number, height: number) {
      let env
      try {
        env = createJsdomEnv({ width, height })
      }
      catch (e) {
        throw new MissingNodeRenderDepsError(
          `Headless rendering requires jsdom. Install it: npm i jsdom @napi-rs/canvas @resvg/resvg-js. (${e instanceof Error ? e.message : String(e)})`,
        )
      }
      const ref: EnvRef = { window: env.window, serializeSvg: env.serializeSvg, serializeFrame: env.serializeFrame, cleanup: env.cleanup }
      ENVS.set(env.container, ref)
      return { container: env.container, cleanup: () => { ENVS.delete(env.container); env.cleanup() } }
    },
    renderToContainer(container: HTMLElement, definition: ChartDefinition, opts: BackendRenderOptions) {
      const ref = ENVS.get(container)
      if (!ref) throw new Error('node-backend: container was not created by this backend')
      installTextShim(ref.window)
      const jsdomWindow = ref.window as unknown as GlobalsBag
      const globals = globalThis as unknown as Partial<GlobalsBag>
      const prev: Partial<GlobalsBag> = {}
      for (const key of FORWARDED_GLOBALS) { prev[key] = globals[key]; globals[key] = jsdomWindow[key] }
      try {
        renderChart(container, definition, {
          sceneIndex: opts.sceneIndex,
          thumbnail: opts.thumbnail ?? false,
          transition: false,
          theme: opts.theme,
        })
      }
      finally {
        for (const key of FORWARDED_GLOBALS) globals[key] = prev[key]
      }
    },
    serializeSvg(container: HTMLElement): string {
      const ref = ENVS.get(container)
      const svg = ref ? ref.serializeSvg() : (container.querySelector('svg')?.outerHTML ?? '')
      if (!svg) throw new Error('node-backend: renderToContainer produced no SVG')
      return ensureSvgNamespace(svg)
    },
    serializeFrame(container: HTMLElement): string {
      const ref = ENVS.get(container)
      if (ref) {
        const frame = ref.serializeFrame()
        if (frame !== undefined) return frame
        // Thumbnail mode — no frame, fall back to SVG.
        return this.serializeSvg(container)
      }
      // Container was not created by this backend — fall back to DOM queries.
      const frameHtml = container.querySelector('.bc-frame')?.outerHTML
      if (frameHtml) return frameHtml
      const svgHtml = container.querySelector('svg')?.outerHTML
      if (svgHtml) return svgHtml
      throw new Error('node-backend: renderToContainer produced no frame')
    },
    async rasterizePng(svg: string, opts: { width?: number, height?: number }): Promise<Uint8Array> {
      try {
        const buf = await rasterizeToPng(ensureSvgNamespace(svg), opts)
        return new Uint8Array(buf)
      }
      catch (e) {
        throw new MissingNodeRenderDepsError(
          `PNG rasterization requires @resvg/resvg-js. Install it: npm i @resvg/resvg-js. (${e instanceof Error ? e.message : String(e)})`,
        )
      }
    },
  }
}
