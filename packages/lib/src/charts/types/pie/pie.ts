import type { ChartData, ChartOptions } from '../../types'
import { renderArc } from '../donut/donut'

export function render(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions = {},
): void {
  renderArc(container, data, options, 0)
}
