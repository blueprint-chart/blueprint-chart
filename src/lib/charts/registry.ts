import type { ChartRenderer } from './types'
import { render as barVertical } from './types/bar-vertical/bar-vertical'
import { render as barHorizontal } from './types/bar-horizontal/bar-horizontal'
import { render as barMulti } from './types/bar-multi/bar-multi'
import { render as line } from './types/line/line'
import { render as lineMulti } from './types/line-multi/line-multi'
import { render as donut } from './types/donut/donut'
import { render as pie } from './types/pie/pie'

const registry = new Map<string, ChartRenderer>()

export function registerChart(name: string, renderer: ChartRenderer): void {
  registry.set(name, renderer)
}

export function getChart(name: string): ChartRenderer | undefined {
  return registry.get(name)
}

export function listCharts(): string[] {
  return Array.from(registry.keys())
}

// Register all chart types
registerChart('bar-vertical', barVertical)
registerChart('bar-horizontal', barHorizontal)
registerChart('bar-multi', barMulti)
registerChart('line', line)
registerChart('line-multi', lineMulti)
registerChart('donut', donut)
registerChart('pie', pie)

// Aliases
registerChart('vertical-bar', barVertical)
registerChart('horizontal-bar', barHorizontal)
