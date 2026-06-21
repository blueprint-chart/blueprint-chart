import { parse } from '../dsl/parser'
import { astToDefinition } from './ast-to-definition'
import { createDomBackend } from './backends/dom-backend'
import type { RenderBackend } from './backends/types'
import type { ChartDefinition } from './types'
import { ChartParseError } from './errors'

export interface RenderApiOptions {
  theme?: string
  scene?: number
  width?: number
  height?: number
  frame?: boolean
}

export interface OutputOptions {
  width?: number
  height?: number
}

export interface ChartHandle {
  toSvg: (opts?: OutputOptions) => Promise<string>
  toHtml: (opts?: OutputOptions) => Promise<string>
  toPng: (opts?: OutputOptions) => Promise<Uint8Array>
  mount: (target: HTMLElement | string) => ChartHandle
  scene: (index: number) => ChartHandle
}

const DEFAULT_WIDTH = 640
const DEFAULT_HEIGHT = 400

function hasDom(): boolean {
  return typeof document !== 'undefined' && typeof document.createElement === 'function'
}

/** Internal; exported for tests. Picks the DOM backend in a browser-like env,
 *  else dynamically loads the Node backend via the conditional subpath export. */
export async function selectBackend(): Promise<RenderBackend> {
  if (hasDom()) {
    return createDomBackend()
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore – no type declarations for conditional subpath export; resolved at runtime
  const mod = await import('@blueprint-chart/lib/internal/node-backend') as { createNodeBackend: () => RenderBackend }
  return mod.createNodeBackend()
}

export async function render(source: string, options: RenderApiOptions = {}): Promise<ChartHandle> {
  let definition: ChartDefinition
  try {
    definition = astToDefinition(parse(source))
  }
  catch (e) {
    throw new ChartParseError(e instanceof Error ? e.message : String(e), { cause: e })
  }

  const backend = await selectBackend()
  const frame = options.frame ?? true
  const state = {
    sceneIndex: options.scene,
    width: options.width ?? DEFAULT_WIDTH,
    height: options.height ?? DEFAULT_HEIGHT,
  }

  function renderInto(container: HTMLElement) {
    backend.renderToContainer(container, definition, {
      sceneIndex: state.sceneIndex,
      thumbnail: !frame,
      theme: options.theme,
    })
  }

  const handle: ChartHandle = {
    async toSvg(opts: OutputOptions = {}): Promise<string> {
      const { container, cleanup } = backend.createContainer(opts.width ?? state.width, opts.height ?? state.height)
      try {
        renderInto(container)
        return backend.serializeSvg(container)
      }
      finally {
        cleanup()
      }
    },
    async toHtml(opts: OutputOptions = {}): Promise<string> {
      const { container, cleanup } = backend.createContainer(opts.width ?? state.width, opts.height ?? state.height)
      try {
        renderInto(container)
        return backend.serializeFrame(container)
      }
      finally {
        cleanup()
      }
    },
    async toPng(opts: OutputOptions = {}): Promise<Uint8Array> {
      const { container, cleanup } = backend.createContainer(opts.width ?? state.width, opts.height ?? state.height)
      let svg: string
      try {
        renderInto(container)
        svg = backend.serializeSvg(container)
      }
      finally {
        cleanup()
      }
      return backend.rasterizePng(svg, { width: opts.width ?? state.width, height: opts.height ?? state.height })
    },
    mount(target: HTMLElement | string): ChartHandle {
      if (backend.kind !== 'dom') {
        console.warn('Blueprint Chart: mount() is a no-op outside a browser environment.')
        return handle
      }
      const el = typeof target === 'string' ? document.querySelector(target) : target
      if (!el) {
        throw new Error(`Blueprint Chart: mount target "${String(target)}" not found`)
      }
      renderInto(el as HTMLElement)
      return handle
    },
    scene(index: number): ChartHandle {
      state.sceneIndex = index
      return handle
    },
  }
  return handle
}
