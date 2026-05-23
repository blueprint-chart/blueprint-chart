import type { ChartData, ChartOptions } from '../../types'
import { renderArc } from '../donut/donut'

/**
 * Render a pie chart.
 *
 * Pie is a thin wrapper around the shared `renderArc` (innerRadiusRatio = 0).
 * Slices are joined via the SceneTransition orchestrator (`featureJoin` with
 * role `'mark-per-category'`) inside `renderArc` itself; this file holds no
 * rendering logic of its own.
 */
export function render(
  container: HTMLElement,
  data: ChartData,
  options: ChartOptions = {},
  transition = false,
): void {
  renderArc(container, data, options, 0, transition)
}
