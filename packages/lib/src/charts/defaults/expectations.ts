import { Concern } from './types'
import type { Matrix } from './types'

/**
 * Audit matrix: Concern × ChartType → Cell.
 *
 * Every entry cites a wiki rule (see /home/dev/Obsidian/Blueprint Chart/wiki/).
 * Phase 2 of the chart defaults audit populates the inner records.
 *
 * Cell statuses:
 *   asserted: current default already matches the wiki rule (test asserts it)
 *   todo:     wiki rule has a target, current default doesn't match (phase 4)
 *   na:       concern doesn't apply to this chart type
 *   open:     wiki has no rule on this cell — flagged for follow-up
 */
export const MATRIX: Matrix = {
  [Concern.DirectLabelling]: {},
  [Concern.Legend]: {},
  [Concern.ValueLabels]: {},
  [Concern.AxisLabels]: {},
  [Concern.Gridlines]: {},
  [Concern.Ticks]: {},
  [Concern.AxisLines]: {},
  [Concern.AxisScaleRange]: {},
  [Concern.ColorPalette]: {},
  [Concern.Crosshair]: {},
  [Concern.Tooltips]: {},
  [Concern.LineInterpolation]: {},
  [Concern.LineSymbols]: {},
  [Concern.BarLayout]: {},
  [Concern.PieDonutLayout]: {},
  [Concern.Stacking]: {},
  [Concern.Sort]: {},
  [Concern.RendererConstants]: {},
}
