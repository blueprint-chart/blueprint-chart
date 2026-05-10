import type { ChartOptionDef, ChartRenderer } from './types'
import {
  ChartType,
  ChartOptionType,
  GridStyle,
  LegendPosition,
  Anchor,
  DirectLabelMode,
  ValueLabelPosition,
  CrosshairDirection,
  CrosshairStyle,
  SymbolShape,
  SymbolShowOn,
  SymbolStyle,
  SortMode,
  StackMode,
  SortDirection,
  Interpolation,
  ScaleType,
  LabelPosition,
  LabelRotation,
  AxisDirection,
} from '../enums'
import { listPalettes } from './palettes'
import { DEFAULT_BAR_GAP } from './scale-helpers'
import { render as barVertical } from './types/bar-vertical/bar-vertical'
import { render as barHorizontal } from './types/bar-horizontal/bar-horizontal'
import { render as barMulti } from './types/bar-multi/bar-multi'
import { render as line } from './types/line/line'
import { render as lineMulti } from './types/line-multi/line-multi'
import { render as donut } from './types/donut/donut'
import { render as pie } from './types/pie/pie'
import { render as area } from './types/area/area'
import { render as areaStacked } from './types/area-stacked/area-stacked'
import { render as columnStacked } from './types/column-stacked/column-stacked'
import { render as barStacked } from './types/bar-stacked/bar-stacked'
import { render as barSplit } from './types/bar-split/bar-split'
import { render as barGrouped } from './types/bar-grouped/bar-grouped'

interface ChartRegistryEntry {
  renderer: ChartRenderer
  options: ChartOptionDef[]
}

const registry = new Map<string, ChartRegistryEntry>()

export function registerChart(name: string, renderer: ChartRenderer, options: ChartOptionDef[]): void {
  registry.set(name, { renderer, options })
}

export function getChart(name: string): ChartRenderer | undefined {
  return registry.get(name)?.renderer
}

export function getChartOptions(name: string): ChartOptionDef[] {
  return registry.get(name)?.options ?? []
}

export function listCharts(): string[] {
  return Array.from(registry.keys())
}

// Shared option definitions
const GRID_STYLE_CHOICES = [
  { value: GridStyle.Solid, text: 'Solid' },
  { value: GridStyle.Dashed, text: 'Dashed' },
  { value: GridStyle.Dotted, text: 'Dotted' },
  { value: GridStyle.None, text: 'None' },
]

const colorsOpt: ChartOptionDef = { key: 'colors', type: ChartOptionType.Colors, label: 'Colors' }
const paletteOpt: ChartOptionDef = {
  key: 'colorPalette',
  type: ChartOptionType.Select,
  label: 'Color palette',
  default: 'Blueprint',
  choices: [
    { value: '', text: 'Custom' },
    ...listPalettes().map(p => ({ value: p.name, text: p.label })),
  ],
}
const autoContrastOpt: ChartOptionDef = { key: 'autoContrast', type: ChartOptionType.Boolean, label: 'Auto-adjust contrast', default: false }
const allowDarkModeOpt: ChartOptionDef = { key: 'allowDarkMode', type: ChartOptionType.Boolean, label: 'Allow dark mode', default: true }
const legendOpt: ChartOptionDef = { key: 'legend', type: ChartOptionType.Boolean, label: 'Show legend', default: true }

const legendPositionOpt: ChartOptionDef = {
  key: 'legendPosition',
  type: ChartOptionType.Select,
  label: 'Legend position',
  default: LegendPosition.Top,
  choices: [
    { value: LegendPosition.Top, text: 'Top' },
    { value: LegendPosition.Bottom, text: 'Bottom' },
    { value: LegendPosition.Left, text: 'Left' },
    { value: LegendPosition.Right, text: 'Right' },
  ],
}

const legendAnchorOpt: ChartOptionDef = {
  key: 'legendAnchor',
  type: ChartOptionType.Select,
  label: 'Legend anchor',
  default: Anchor.Start,
  choices: [
    { value: Anchor.Start, text: 'Start' },
    { value: Anchor.Middle, text: 'Middle' },
    { value: Anchor.End, text: 'End' },
  ],
}

const directLabellingOpt: ChartOptionDef = {
  key: 'directLabelling',
  type: ChartOptionType.Select,
  label: 'Direct labelling',
  default: DirectLabelMode.Off,
  choices: [
    { value: DirectLabelMode.Off, text: 'Off' },
    { value: DirectLabelMode.Auto, text: 'Auto' },
    { value: DirectLabelMode.Outside, text: 'Outside' },
    { value: DirectLabelMode.Inside, text: 'Inside' },
  ],
}
const directLabelAnchorOpt: ChartOptionDef = {
  key: 'directLabelAnchor',
  type: ChartOptionType.Select,
  label: 'Label anchor',
  default: Anchor.Middle,
  choices: [
    { value: Anchor.Start, text: 'Start' },
    { value: Anchor.Middle, text: 'Middle' },
    { value: Anchor.End, text: 'End' },
  ],
}
const valueLabelsOpt: ChartOptionDef = { key: 'valueLabels', type: ChartOptionType.Boolean, label: 'Value labels', default: false }
const valueLabelPositionOpt: ChartOptionDef = {
  key: 'valueLabelPosition',
  type: ChartOptionType.Select,
  label: 'Label position',
  default: ValueLabelPosition.Auto,
  choices: [
    { value: ValueLabelPosition.Auto, text: 'Auto' },
    { value: ValueLabelPosition.Outside, text: 'Outside' },
    { value: ValueLabelPosition.Inside, text: 'Inside' },
  ],
}
const tooltipsOpt: ChartOptionDef = { key: 'tooltips', type: ChartOptionType.Boolean, label: 'Tooltips', default: false }
const crosshairOpt: ChartOptionDef = { key: 'crosshair', type: ChartOptionType.Boolean, label: 'Crosshair', default: false }
const crosshairDirectionOpt: ChartOptionDef = {
  key: 'crosshairDirection',
  type: ChartOptionType.Select,
  label: 'Crosshair direction',
  default: CrosshairDirection.Both,
  choices: [
    { value: CrosshairDirection.Both, text: 'Both' },
    { value: CrosshairDirection.Vertical, text: 'Vertical' },
    { value: CrosshairDirection.Horizontal, text: 'Horizontal' },
  ],
}
const crosshairStyleOpt: ChartOptionDef = {
  key: 'crosshairStyle',
  type: ChartOptionType.Select,
  label: 'Crosshair style',
  default: CrosshairStyle.Dashed,
  choices: [
    { value: CrosshairStyle.Solid, text: 'Solid' },
    { value: CrosshairStyle.Dashed, text: 'Dashed' },
    { value: CrosshairStyle.Dotted, text: 'Dotted' },
  ],
}
const crosshairColorOpt: ChartOptionDef = { key: 'crosshairColor', type: ChartOptionType.Text, label: 'Crosshair color', default: '#999', placeholder: '#999' }
const lineSymbolsOpt: ChartOptionDef = { key: 'lineSymbols', type: ChartOptionType.Boolean, label: 'Show line symbols', default: false }
const lineSymbolShapeOpt: ChartOptionDef = {
  key: 'lineSymbolShape',
  type: ChartOptionType.Select,
  label: 'Symbol',
  default: SymbolShape.Circle,
  choices: [
    { value: SymbolShape.Circle, text: 'Circle' },
    { value: SymbolShape.Square, text: 'Square' },
    { value: SymbolShape.Diamond, text: 'Diamond' },
    { value: SymbolShape.Triangle, text: 'Triangle Up' },
    { value: SymbolShape.TriangleDown, text: 'Triangle Down' },
    { value: SymbolShape.Cross, text: 'Cross' },
    { value: SymbolShape.Star, text: 'Star' },
  ],
}
const lineSymbolShowOnOpt: ChartOptionDef = {
  key: 'lineSymbolShowOn',
  type: ChartOptionType.Select,
  label: 'Show on',
  default: SymbolShowOn.FirstLast,
  choices: [
    { value: SymbolShowOn.FirstLast, text: 'First & Last' },
    { value: SymbolShowOn.First, text: 'First' },
    { value: SymbolShowOn.Last, text: 'Last' },
    { value: SymbolShowOn.All, text: 'All' },
  ],
}
const lineSymbolStyleOpt: ChartOptionDef = {
  key: 'lineSymbolStyle',
  type: ChartOptionType.Select,
  label: 'Style',
  default: SymbolStyle.Filled,
  choices: [
    { value: SymbolStyle.Filled, text: 'Filled' },
    { value: SymbolStyle.Hollow, text: 'Hollow' },
  ],
}
const lineSymbolSizeOpt: ChartOptionDef = { key: 'lineSymbolSize', type: ChartOptionType.Text, label: 'Size', default: '3.5', placeholder: '3.5' }
const lineSymbolOpacityOpt: ChartOptionDef = { key: 'lineSymbolOpacity', type: ChartOptionType.Text, label: 'Opacity', default: '1', placeholder: '1' }

const sortModeOpt: ChartOptionDef = {
  key: 'sortMode',
  type: ChartOptionType.Select,
  label: 'Sort mode',
  default: SortMode.None,
  choices: [
    { value: SortMode.None, text: 'None' },
    { value: SortMode.Total, text: 'By total' },
    { value: SortMode.WithinGroups, text: 'Within groups' },
  ],
}

const edgePaddingOpt: ChartOptionDef = { key: 'edgePadding', type: ChartOptionType.Boolean, label: 'Edge padding', default: false }
const waterfallOpt: ChartOptionDef = { key: 'waterfall', type: ChartOptionType.Boolean, label: 'Waterfall', default: false }
const waterfallTotalOpt: ChartOptionDef = { key: 'waterfallTotal', type: ChartOptionType.Boolean, label: 'Waterfall total', default: false }

const barBackgroundOpt: ChartOptionDef = { key: 'barBackground', type: ChartOptionType.Boolean, label: 'Bar background', default: false }
const barGapOpt: ChartOptionDef = { key: 'barGap', type: ChartOptionType.Text, label: 'Bar gap', default: String(DEFAULT_BAR_GAP), placeholder: String(DEFAULT_BAR_GAP) }
const barSeparatorsOpt: ChartOptionDef = { key: 'barSeparators', type: ChartOptionType.Boolean, label: 'Bar separators', default: false }
const connectedColumnsOpt: ChartOptionDef = { key: 'connectedColumns', type: ChartOptionType.Boolean, label: 'Connected columns', default: false }
const connectionsOpacityOpt: ChartOptionDef = { key: 'connectionsOpacity', type: ChartOptionType.Text, label: 'Opacity', default: '0.15', placeholder: '0.15' }
const swapLabelValueOpt: ChartOptionDef = { key: 'swapLabelValue', type: ChartOptionType.Boolean, label: 'Swap labels and values', default: false }
const stackModeOpt: ChartOptionDef = {
  key: 'stackMode',
  type: ChartOptionType.Select,
  label: 'Stack mode',
  default: StackMode.Normal,
  choices: [
    { value: StackMode.Normal, text: 'Normal' },
    { value: StackMode.Percent, text: 'Percentage (100%)' },
  ],
}

const sharedScaleOpt: ChartOptionDef = { key: 'sharedScale', type: ChartOptionType.Boolean, label: 'Shared scale', default: false }
const categoryLabelLineOpt: ChartOptionDef = { key: 'categoryLabelLine', type: ChartOptionType.Boolean, label: 'Labels on separate line', default: false }
const displayAsPercentageOpt: ChartOptionDef = { key: 'displayAsPercentage', type: ChartOptionType.Boolean, label: 'Display as percentage', default: false }
const showTotalOpt: ChartOptionDef = { key: 'showTotal', type: ChartOptionType.Boolean, label: 'Show total', default: false }
const showLabelsOpt: ChartOptionDef = { key: 'showLabels', type: ChartOptionType.Boolean, label: 'Show labels', default: true }
const showValuesOpt: ChartOptionDef = { key: 'showValues', type: ChartOptionType.Boolean, label: 'Show values', default: true }
const sliceMaxOpt: ChartOptionDef = { key: 'sliceMax', type: ChartOptionType.Text, label: 'Max slices', default: '6' }
const sliceGroupLabelOpt: ChartOptionDef = { key: 'sliceGroupLabel', type: ChartOptionType.Text, label: 'Group label', default: 'Others', placeholder: 'Others' }

const areaFillOpacityOpt: ChartOptionDef = { key: 'areaFillOpacity', type: ChartOptionType.Text, label: 'Opacity', default: '0.85', placeholder: '0.85' }
const stackedOpt: ChartOptionDef = { key: 'stacked', type: ChartOptionType.Boolean, label: 'Stack areas', default: true }
const stackPercentOpt: ChartOptionDef = { key: 'stackPercent', type: ChartOptionType.Boolean, label: 'Stack to 100%', default: false }
const areaLinesOpt: ChartOptionDef = { key: 'areaLines', type: ChartOptionType.Boolean, label: 'Separate areas with lines', default: true }
const areaSortModeOpt: ChartOptionDef = {
  key: 'areaSortMode',
  type: ChartOptionType.Select,
  label: 'Sort areas',
  default: SortDirection.None,
  choices: [
    { value: SortDirection.None, text: 'Keep order' },
    { value: SortDirection.Ascending, text: 'Smallest first' },
    { value: SortDirection.Descending, text: 'Largest first' },
  ],
}

const interpolationOpt: ChartOptionDef = {
  key: 'interpolation',
  type: ChartOptionType.Select,
  label: 'Line interpolation',
  default: Interpolation.Linear,
  choices: [
    { value: Interpolation.Linear, text: 'Linear' },
    { value: Interpolation.MonotoneX, text: 'Monotone' },
    { value: Interpolation.Step, text: 'Step' },
    { value: Interpolation.StepBefore, text: 'Step (before)' },
    { value: Interpolation.StepAfter, text: 'Step (after)' },
    { value: Interpolation.Basis, text: 'Basis' },
    { value: Interpolation.Cardinal, text: 'Cardinal' },
    { value: Interpolation.CatmullRom, text: 'Catmull-Rom' },
  ],
}

// NYT-style axis defaults per chart type:
// - Bar vertical / bar multi: horizontal grid lines (dashed), no vertical grid
// - Bar horizontal: vertical grid lines (dashed), no horizontal grid
// - Line / line multi: horizontal grid lines (dashed), no vertical grid

const SCALE_TYPE_CHOICES = [
  { value: ScaleType.Linear, text: 'Linear' },
  { value: ScaleType.Log, text: 'Logarithmic' },
]

const LABEL_POSITION_CHOICES = [
  { value: LabelPosition.Auto, text: 'Auto' },
  { value: LabelPosition.Inside, text: 'Inside' },
  { value: LabelPosition.Outside, text: 'Outside' },
  { value: LabelPosition.Off, text: 'Off' },
]

const LABEL_ROTATION_CHOICES = [
  { value: LabelRotation.Auto, text: 'Auto' },
  { value: LabelRotation.Horizontal, text: 'Horizontal' },
  { value: LabelRotation.Vertical, text: 'Vertical' },
]

function axisOpts(defaults: {
  verticalGrid: GridStyle
  horizontalGrid: GridStyle
  showVerticalTicks: boolean
  showHorizontalTicks: boolean
  showVerticalAxis?: boolean
  valueAxis?: 'vertical' | 'horizontal'
  horizontalRange?: boolean
}): ChartOptionDef[] {
  return [
    { key: 'showVerticalAxis', type: ChartOptionType.Boolean, label: 'Show vertical axis', default: defaults.showVerticalAxis ?? true },
    { key: 'verticalAxisDirection', type: ChartOptionType.Select, label: 'Vertical axis side', default: AxisDirection.Left, choices: [{ value: AxisDirection.Left, text: 'Left' }, { value: AxisDirection.Right, text: 'Right' }] },
    { key: 'showVerticalTicks', type: ChartOptionType.Boolean, label: 'Show vertical ticks', default: defaults.showVerticalTicks },
    { key: 'verticalLabelPosition', type: ChartOptionType.Select, label: 'Vertical labels', default: LabelPosition.Auto, choices: LABEL_POSITION_CHOICES },
    { key: 'verticalGridStyle', type: ChartOptionType.Select, label: 'Vertical grid style', default: defaults.verticalGrid, choices: GRID_STYLE_CHOICES },
    { key: 'verticalNumberFormat', type: ChartOptionType.NumberFormat, label: 'Vertical number format' },
    ...(defaults.valueAxis === 'vertical'
      ? [
          { key: 'verticalScaleType', type: ChartOptionType.Select as const, label: 'Vertical scale', default: ScaleType.Linear, choices: SCALE_TYPE_CHOICES },
          { key: 'verticalRangeMin', type: ChartOptionType.Text as const, label: 'Vertical min', placeholder: 'auto' },
          { key: 'verticalRangeMax', type: ChartOptionType.Text as const, label: 'Vertical max', placeholder: 'auto' },
        ]
      : []),
    { key: 'showHorizontalAxis', type: ChartOptionType.Boolean, label: 'Show horizontal axis', default: true },
    { key: 'showHorizontalTicks', type: ChartOptionType.Boolean, label: 'Show horizontal ticks', default: defaults.showHorizontalTicks },
    { key: 'horizontalLabelPosition', type: ChartOptionType.Select, label: 'Horizontal labels', default: LabelPosition.Auto, choices: LABEL_POSITION_CHOICES },
    { key: 'horizontalLabelRotation', type: ChartOptionType.Select, label: 'Horizontal label rotation', default: LabelRotation.Auto, choices: LABEL_ROTATION_CHOICES },
    { key: 'horizontalGridStyle', type: ChartOptionType.Select, label: 'Horizontal grid style', default: defaults.horizontalGrid, choices: GRID_STYLE_CHOICES },
    { key: 'horizontalNumberFormat', type: ChartOptionType.NumberFormat, label: 'Horizontal number format' },
    ...(defaults.valueAxis === 'horizontal'
      ? [
          { key: 'horizontalScaleType', type: ChartOptionType.Select as const, label: 'Horizontal scale', default: ScaleType.Linear, choices: SCALE_TYPE_CHOICES },
          { key: 'horizontalRangeMin', type: ChartOptionType.Text as const, label: 'Horizontal min', placeholder: 'auto' },
          { key: 'horizontalRangeMax', type: ChartOptionType.Text as const, label: 'Horizontal max', placeholder: 'auto' },
        ]
      : []),
    ...(defaults.horizontalRange
      ? [
          { key: 'horizontalRangeMin', type: ChartOptionType.Text as const, label: 'Horizontal min', placeholder: 'auto' },
          { key: 'horizontalRangeMax', type: ChartOptionType.Text as const, label: 'Horizontal max', placeholder: 'auto' },
        ]
      : []),
  ]
}

// Vertical bars: value axis is vertical → horizontal dashed grid, no vertical grid, no ticks on category axis, no vertical axis line
const barVerticalAxisOpts = axisOpts({ verticalGrid: GridStyle.Dashed, horizontalGrid: GridStyle.None, showVerticalTicks: false, showHorizontalTicks: false, showVerticalAxis: false, valueAxis: 'vertical' })

// Horizontal bars: value axis is horizontal → vertical dashed grid, no horizontal grid, no ticks on category axis
const barHorizontalAxisOpts = axisOpts({ verticalGrid: GridStyle.None, horizontalGrid: GridStyle.Dashed, showVerticalTicks: false, showHorizontalTicks: false, valueAxis: 'horizontal' })

// Lines: value axis is vertical → horizontal dashed grid, no vertical grid, no vertical axis line
const lineAxisOpts = axisOpts({ verticalGrid: GridStyle.Dashed, horizontalGrid: GridStyle.None, showVerticalTicks: false, showHorizontalTicks: false, showVerticalAxis: false, valueAxis: 'vertical', horizontalRange: true })

// Per-chart-type option overrides based on dataviz best practices.
// Defaults are audited against the project wiki; see docs/superpowers/specs/2026-05-10-chart-defaults-audit-design.md
// and packages/lib/src/charts/defaults/expectations.ts for the per-cell verdicts.
// Line charts: monotone interpolation is smooth and non-distorting (preferred over linear for general use)
const lineInterpolationOpt: ChartOptionDef = { ...interpolationOpt, default: Interpolation.MonotoneX }
// Line charts: vertical crosshair is standard for time-series data
const lineCrosshairDirectionOpt: ChartOptionDef = { ...crosshairDirectionOpt, default: CrosshairDirection.Vertical }
// Multi-line: direct labeling preferred over legends ("label lines directly instead of using a legend")
const lineMultiDirectLabellingOpt: ChartOptionDef = { ...directLabellingOpt, default: DirectLabelMode.Auto }
// Horizontal bars: value labels at end of bar are a best practice for readability
const barHorizontalValueLabelsOpt: ChartOptionDef = { ...valueLabelsOpt, default: true }
// Pie: display as percentage (pies show proportions), limit to 5 slices (not 6)
const pieDisplayAsPercentageOpt: ChartOptionDef = { ...displayAsPercentageOpt, default: true }
const pieSliceMaxOpt: ChartOptionDef = { ...sliceMaxOpt, default: '5' }
// Donut: show total in center ("show a primary metric in the center when meaningful")
const donutShowTotalOpt: ChartOptionDef = { ...showTotalOpt, default: true }

// Register all chart types
const crosshairOpts = [crosshairOpt, crosshairDirectionOpt, crosshairStyleOpt, crosshairColorOpt]
const lineCrosshairOpts = [crosshairOpt, lineCrosshairDirectionOpt, crosshairStyleOpt, crosshairColorOpt]
const barOpts = [valueLabelsOpt, valueLabelPositionOpt, tooltipsOpt, ...crosshairOpts]
const barHorizontalOpts = [barHorizontalValueLabelsOpt, valueLabelPositionOpt, tooltipsOpt, ...crosshairOpts]
const lineSymbolOpts = [lineSymbolsOpt, lineSymbolShapeOpt, lineSymbolShowOnOpt, lineSymbolStyleOpt, lineSymbolSizeOpt, lineSymbolOpacityOpt]
const lineOpts = [valueLabelsOpt, tooltipsOpt, ...lineCrosshairOpts, ...lineSymbolOpts]
const pieArcOpts = [pieDisplayAsPercentageOpt, showTotalOpt, showLabelsOpt, showValuesOpt, pieSliceMaxOpt, sliceGroupLabelOpt]
const donutArcOpts = [displayAsPercentageOpt, donutShowTotalOpt, showLabelsOpt, showValuesOpt, sliceMaxOpt, sliceGroupLabelOpt]

registerChart(ChartType.BarVertical, barVertical, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, swapLabelValueOpt, barBackgroundOpt, barSeparatorsOpt, barGapOpt, connectedColumnsOpt, connectionsOpacityOpt, waterfallOpt, waterfallTotalOpt, categoryLabelLineOpt, ...barVerticalAxisOpts, ...barOpts])
registerChart(ChartType.BarHorizontal, barHorizontal, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, swapLabelValueOpt, barBackgroundOpt, barSeparatorsOpt, barGapOpt, connectedColumnsOpt, connectionsOpacityOpt, waterfallOpt, waterfallTotalOpt, categoryLabelLineOpt, ...barHorizontalAxisOpts, ...barHorizontalOpts])
registerChart(ChartType.BarMulti, barMulti, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, sortModeOpt, legendOpt, legendAnchorOpt, legendPositionOpt, directLabellingOpt, directLabelAnchorOpt, ...barVerticalAxisOpts, ...barOpts])
registerChart(ChartType.Line, line, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, lineInterpolationOpt, edgePaddingOpt, ...lineAxisOpts, ...lineOpts])
registerChart(ChartType.LineMulti, lineMulti, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, lineInterpolationOpt, edgePaddingOpt, sortModeOpt, legendOpt, legendAnchorOpt, legendPositionOpt, lineMultiDirectLabellingOpt, ...lineAxisOpts, ...lineOpts])
registerChart(ChartType.Donut, donut, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, legendOpt, legendAnchorOpt, legendPositionOpt, directLabellingOpt, tooltipsOpt, ...donutArcOpts])
registerChart(ChartType.Pie, pie, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, legendOpt, legendAnchorOpt, legendPositionOpt, directLabellingOpt, tooltipsOpt, ...pieArcOpts])

// Area: same axis options as line, same interaction options
registerChart(ChartType.Area, area, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, lineInterpolationOpt, edgePaddingOpt, ...lineAxisOpts, ...lineOpts])

// Areas (multi-series with optional stacking)
const areaStackedAxisOpts = axisOpts({ verticalGrid: GridStyle.Dashed, horizontalGrid: GridStyle.None, showVerticalTicks: false, showHorizontalTicks: false, showVerticalAxis: false, valueAxis: 'vertical', horizontalRange: true })
registerChart(ChartType.AreaStacked, areaStacked, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, areaFillOpacityOpt, lineInterpolationOpt, edgePaddingOpt, areaSortModeOpt, stackedOpt, stackPercentOpt, areaLinesOpt, legendOpt, legendAnchorOpt, legendPositionOpt, directLabellingOpt, ...areaStackedAxisOpts, tooltipsOpt, ...lineCrosshairOpts])

// Stacked column: vertical bars stacked
registerChart(ChartType.ColumnStacked, columnStacked, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, stackModeOpt, sortModeOpt, legendOpt, legendAnchorOpt, legendPositionOpt, directLabellingOpt, directLabelAnchorOpt, ...barVerticalAxisOpts, ...barOpts])

// Stacked bar: horizontal bars stacked
registerChart(ChartType.BarStacked, barStacked, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, stackModeOpt, sortModeOpt, legendOpt, legendAnchorOpt, legendPositionOpt, directLabellingOpt, directLabelAnchorOpt, categoryLabelLineOpt, ...barHorizontalAxisOpts, ...barHorizontalOpts])

// Split bars: each series rendered as its own panel of horizontal bars
registerChart(ChartType.BarSplit, barSplit, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, sharedScaleOpt, sortModeOpt, legendOpt, legendAnchorOpt, legendPositionOpt, categoryLabelLineOpt, ...barHorizontalAxisOpts, barHorizontalValueLabelsOpt, valueLabelPositionOpt, tooltipsOpt, ...crosshairOpts])

// Grouped bars: each category rendered as a group of horizontal bars, one per series
registerChart(ChartType.BarGrouped, barGrouped, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, sortModeOpt, legendOpt, legendAnchorOpt, legendPositionOpt, barBackgroundOpt, barSeparatorsOpt, categoryLabelLineOpt, ...barHorizontalAxisOpts, barHorizontalValueLabelsOpt, valueLabelPositionOpt, tooltipsOpt, ...crosshairOpts])

// Aliases share the same entry
registerChart(ChartType.VerticalBar, barVertical, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, swapLabelValueOpt, barBackgroundOpt, barSeparatorsOpt, barGapOpt, connectedColumnsOpt, connectionsOpacityOpt, waterfallOpt, waterfallTotalOpt, categoryLabelLineOpt, ...barVerticalAxisOpts, ...barOpts])
registerChart(ChartType.HorizontalBar, barHorizontal, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, swapLabelValueOpt, barBackgroundOpt, barSeparatorsOpt, barGapOpt, connectedColumnsOpt, connectionsOpacityOpt, waterfallOpt, waterfallTotalOpt, categoryLabelLineOpt, ...barHorizontalAxisOpts, ...barHorizontalOpts])
