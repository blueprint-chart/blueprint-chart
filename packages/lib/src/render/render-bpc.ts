import { parse } from '../dsl/parser'
import { astToDefinition } from './ast-to-definition'
import { renderChart } from './render-chart'
import type { RenderOptions } from './types'

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
  const ast = parse(bpc)
  const definition = astToDefinition(ast)
  renderChart(container, definition, options)
}
