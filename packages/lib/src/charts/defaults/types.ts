import type { ChartType } from '../../enums'

export const Concern = {
  DirectLabelling: 'directLabelling',
  Legend: 'legend',
  ValueLabels: 'valueLabels',
  AxisLabels: 'axisLabels',
  Gridlines: 'gridlines',
  Ticks: 'ticks',
  AxisLines: 'axisLines',
  AxisScaleRange: 'axisScaleRange',
  ColorPalette: 'colorPalette',
  Crosshair: 'crosshair',
  Tooltips: 'tooltips',
  LineInterpolation: 'lineInterpolation',
  LineSymbols: 'lineSymbols',
  BarLayout: 'barLayout',
  PieDonutLayout: 'pieDonutLayout',
  Stacking: 'stacking',
  Sort: 'sort',
  RendererConstants: 'rendererConstants',
} as const
export type Concern = typeof Concern[keyof typeof Concern]

export const ALL_CONCERNS: readonly Concern[] = Object.values(Concern)

// ChartTypes the audit covers. Aliases (VerticalBar, HorizontalBar) inherit
// their target's defaults and are not separately tested.
import { ChartType as CT } from '../../enums'
export const AUDITED_CHART_TYPES: readonly ChartType[] = [
  CT.BarVertical,
  CT.BarHorizontal,
  CT.BarMulti,
  CT.BarStacked,
  CT.BarSplit,
  CT.BarGrouped,
  CT.ColumnStacked,
  CT.Line,
  CT.LineMulti,
  CT.Area,
  CT.AreaStacked,
  CT.Donut,
  CT.Pie,
]

// Status of an audit cell. Mirrors the spec's verdict workflow:
//   - 'asserted': matches — current default == wiki rule (test asserts it)
//   - 'todo':     violates OR ambiguous — phase 4 needs to flip the default to `target`.
//                 Use the optional `notes` field on TodoCell to document ambiguity rationale.
//   - 'na':       concern doesn't apply to this chart type
//   - 'open':     wiki has no rule on this cell; flagged for follow-up
export type CellStatus = 'asserted' | 'todo' | 'na' | 'open'

export interface AssertedCell {
  status: 'asserted'
  optionKey: string  // key in registry.ts ChartOptionDef list
  target: unknown
  rule: string  // citation, e.g. 'wiki/concepts/labels-and-legends.md § Direct labeling is preferred'
}

export interface TodoCell {
  status: 'todo'
  optionKey: string
  current: unknown  // value as registered today
  target: unknown   // value the audit will move to in phase 4
  rule: string
  notes?: string
}

export interface NaCell {
  status: 'na'
  reason: string  // why the concern doesn't apply to this chart type
}

export interface OpenCell {
  status: 'open'
  optionKey?: string
  current?: unknown
  notes: string  // why no wiki rule fits / what's missing
}

export type Cell = AssertedCell | TodoCell | NaCell | OpenCell

// Per-concern map: ChartType → Cell
export type ConcernMatrix = Partial<Record<ChartType, Cell>>

// Full matrix: Concern → ConcernMatrix
export type Matrix = Record<Concern, ConcernMatrix>
