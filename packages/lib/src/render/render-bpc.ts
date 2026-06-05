import { parse } from '../dsl/parser'
import { astToDefinition } from './ast-to-definition'
import { renderChart } from './render-chart'
import type { ChartNode } from '../dsl/types'
import type { RenderOptions } from './types'

function renderError(container: HTMLElement, title: string, message: string): void {
  const el = document.createElement('div')
  el.style.cssText
    = 'color: #888; font-family: monospace; padding: 0.75rem; white-space: pre-wrap;'
  el.textContent = `Blueprint Chart: ${title}\n${message}`
  container.replaceChildren(el)
}

export function renderBpc(
  container: HTMLElement,
  bpc: string,
  options?: RenderOptions,
): void {
  if (!bpc) {
    if (!options?.transition) {
      container.replaceChildren()
    }
    return
  }
  let ast: ChartNode
  try {
    ast = parse(bpc)
  }
  catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    renderError(container, 'could not parse chart', message)
    return
  }
  try {
    const definition = astToDefinition(ast)
    renderChart(container, definition, options)
  }
  catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    renderError(container, 'could not render chart', message)
  }
}
