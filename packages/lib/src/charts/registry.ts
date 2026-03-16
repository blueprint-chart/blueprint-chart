import type { ChartOptionDef, ChartRenderer } from './types'
import { listPalettes } from './palettes'
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
  { value: 'solid', text: 'Solid' },
  { value: 'dashed', text: 'Dashed' },
  { value: 'dotted', text: 'Dotted' },
  { value: 'none', text: 'None' },
]

const colorsOpt: ChartOptionDef = { key: 'colors', type: 'colors', label: 'Colors' }
const paletteOpt: ChartOptionDef = {
  key: 'colorPalette',
  type: 'select',
  label: 'Color palette',
  default: 'Blueprint',
  choices: [
    { value: '', text: 'Custom' },
    ...listPalettes().map(p => ({ value: p.name, text: p.label })),
  ],
}
const autoContrastOpt: ChartOptionDef = { key: 'autoContrast', type: 'boolean', label: 'Auto-adjust contrast', default: false }
const allowDarkModeOpt: ChartOptionDef = { key: 'allowDarkMode', type: 'boolean', label: 'Allow dark mode', default: true }
const legendOpt: ChartOptionDef = { key: 'legend', type: 'boolean', label: 'Show legend', default: true }

const legendPositionOpt: ChartOptionDef = {
  key: 'legendPosition',
  type: 'select',
  label: 'Legend position',
  default: 'top',
  choices: [
    { value: 'top', text: 'Top' },
    { value: 'bottom', text: 'Bottom' },
    { value: 'left', text: 'Left' },
    { value: 'right', text: 'Right' },
  ],
}

const legendAnchorOpt: ChartOptionDef = {
  key: 'legendAnchor',
  type: 'select',
  label: 'Legend anchor',
  default: 'start',
  choices: [
    { value: 'start', text: 'Start' },
    { value: 'middle', text: 'Middle' },
    { value: 'end', text: 'End' },
  ],
}

const directLabellingOpt: ChartOptionDef = {
  key: 'directLabelling',
  type: 'select',
  label: 'Direct labelling',
  default: '',
  choices: [
    { value: '', text: 'Off' },
    { value: 'auto', text: 'Auto' },
    { value: 'outside', text: 'Outside' },
    { value: 'inside', text: 'Inside' },
  ],
}
const directLabelAnchorOpt: ChartOptionDef = {
  key: 'directLabelAnchor',
  type: 'select',
  label: 'Label anchor',
  default: 'middle',
  choices: [
    { value: 'start', text: 'Start' },
    { value: 'middle', text: 'Middle' },
    { value: 'end', text: 'End' },
  ],
}
const valueLabelsOpt: ChartOptionDef = { key: 'valueLabels', type: 'boolean', label: 'Value labels', default: false }
const valueLabelPositionOpt: ChartOptionDef = {
  key: 'valueLabelPosition',
  type: 'select',
  label: 'Label position',
  default: 'auto',
  choices: [
    { value: 'auto', text: 'Auto' },
    { value: 'outside', text: 'Outside' },
    { value: 'inside', text: 'Inside' },
  ],
}
const tooltipsOpt: ChartOptionDef = { key: 'tooltips', type: 'boolean', label: 'Tooltips', default: false }
const crosshairOpt: ChartOptionDef = { key: 'crosshair', type: 'boolean', label: 'Crosshair', default: false }
const crosshairDirectionOpt: ChartOptionDef = {
  key: 'crosshairDirection',
  type: 'select',
  label: 'Crosshair direction',
  default: 'both',
  choices: [
    { value: 'both', text: 'Both' },
    { value: 'vertical', text: 'Vertical' },
    { value: 'horizontal', text: 'Horizontal' },
  ],
}
const crosshairStyleOpt: ChartOptionDef = {
  key: 'crosshairStyle',
  type: 'select',
  label: 'Crosshair style',
  default: 'dashed',
  choices: [
    { value: 'solid', text: 'Solid' },
    { value: 'dashed', text: 'Dashed' },
    { value: 'dotted', text: 'Dotted' },
  ],
}
const crosshairColorOpt: ChartOptionDef = { key: 'crosshairColor', type: 'text', label: 'Crosshair color', default: '#999', placeholder: '#999' }
const lineSymbolsOpt: ChartOptionDef = { key: 'lineSymbols', type: 'boolean', label: 'Show line symbols', default: false }
const lineSymbolShapeOpt: ChartOptionDef = {
  key: 'lineSymbolShape',
  type: 'select',
  label: 'Symbol',
  default: 'circle',
  choices: [
    { value: 'circle', text: 'Circle' },
    { value: 'square', text: 'Square' },
    { value: 'diamond', text: 'Diamond' },
    { value: 'triangle', text: 'Triangle Up' },
    { value: 'triangleDown', text: 'Triangle Down' },
    { value: 'cross', text: 'Cross' },
    { value: 'star', text: 'Star' },
  ],
}
const lineSymbolShowOnOpt: ChartOptionDef = {
  key: 'lineSymbolShowOn',
  type: 'select',
  label: 'Show on',
  default: 'firstLast',
  choices: [
    { value: 'firstLast', text: 'First & Last' },
    { value: 'first', text: 'First' },
    { value: 'last', text: 'Last' },
    { value: 'all', text: 'All' },
  ],
}
const lineSymbolStyleOpt: ChartOptionDef = {
  key: 'lineSymbolStyle',
  type: 'select',
  label: 'Style',
  default: 'filled',
  choices: [
    { value: 'filled', text: 'Filled' },
    { value: 'hollow', text: 'Hollow' },
  ],
}
const lineSymbolSizeOpt: ChartOptionDef = { key: 'lineSymbolSize', type: 'text', label: 'Size', default: '3.5', placeholder: '3.5' }
const lineSymbolOpacityOpt: ChartOptionDef = { key: 'lineSymbolOpacity', type: 'text', label: 'Opacity', default: '1', placeholder: '1' }

const sortModeOpt: ChartOptionDef = {
  key: 'sortMode',
  type: 'select',
  label: 'Sort mode',
  default: 'none',
  choices: [
    { value: 'none', text: 'None' },
    { value: 'total', text: 'By total' },
    { value: 'within-groups', text: 'Within groups' },
  ],
}

const edgePaddingOpt: ChartOptionDef = { key: 'edgePadding', type: 'boolean', label: 'Edge padding', default: false }
const waterfallOpt: ChartOptionDef = { key: 'waterfall', type: 'boolean', label: 'Waterfall', default: false }
const waterfallTotalOpt: ChartOptionDef = { key: 'waterfallTotal', type: 'boolean', label: 'Waterfall total', default: false }

const barBackgroundOpt: ChartOptionDef = { key: 'barBackground', type: 'boolean', label: 'Bar background', default: false }
const barSeparatorsOpt: ChartOptionDef = { key: 'barSeparators', type: 'boolean', label: 'Bar separators', default: false }
const swapLabelValueOpt: ChartOptionDef = { key: 'swapLabelValue', type: 'boolean', label: 'Swap labels and values', default: false }
const stackModeOpt: ChartOptionDef = {
  key: 'stackMode',
  type: 'select',
  label: 'Stack mode',
  default: 'normal',
  choices: [
    { value: 'normal', text: 'Normal' },
    { value: 'percent', text: 'Percentage (100%)' },
  ],
}

const displayAsPercentageOpt: ChartOptionDef = { key: 'displayAsPercentage', type: 'boolean', label: 'Display as percentage', default: false }
const showTotalOpt: ChartOptionDef = { key: 'showTotal', type: 'boolean', label: 'Show total', default: false }
const showLabelsOpt: ChartOptionDef = { key: 'showLabels', type: 'boolean', label: 'Show labels', default: true }
const showValuesOpt: ChartOptionDef = { key: 'showValues', type: 'boolean', label: 'Show values', default: true }
const sliceMaxOpt: ChartOptionDef = { key: 'sliceMax', type: 'text', label: 'Max slices', default: '6' }
const sliceGroupLabelOpt: ChartOptionDef = { key: 'sliceGroupLabel', type: 'text', label: 'Group label', default: 'Others', placeholder: 'Others' }

const interpolationOpt: ChartOptionDef = {
  key: 'interpolation',
  type: 'select',
  label: 'Line interpolation',
  default: 'linear',
  choices: [
    { value: 'linear', text: 'Linear' },
    { value: 'monotoneX', text: 'Monotone' },
    { value: 'step', text: 'Step' },
    { value: 'stepBefore', text: 'Step (before)' },
    { value: 'stepAfter', text: 'Step (after)' },
    { value: 'basis', text: 'Basis' },
    { value: 'cardinal', text: 'Cardinal' },
    { value: 'catmullRom', text: 'Catmull-Rom' },
  ],
}

// NYT-style axis defaults per chart type:
// - Bar vertical / bar multi: horizontal grid lines (dashed), no vertical grid
// - Bar horizontal: vertical grid lines (dashed), no horizontal grid
// - Line / line multi: horizontal grid lines (dashed), no vertical grid

const SCALE_TYPE_CHOICES = [
  { value: 'linear', text: 'Linear' },
  { value: 'log', text: 'Logarithmic' },
]

const LABEL_POSITION_CHOICES = [
  { value: 'auto', text: 'Auto' },
  { value: 'inside', text: 'Inside' },
  { value: 'outside', text: 'Outside' },
  { value: 'off', text: 'Off' },
]

function axisOpts(defaults: {
  verticalGrid: string
  horizontalGrid: string
  showVerticalTicks: boolean
  showHorizontalTicks: boolean
  showVerticalAxis?: boolean
  valueAxis?: 'vertical' | 'horizontal'
  horizontalRange?: boolean
}): ChartOptionDef[] {
  return [
    { key: 'showVerticalAxis', type: 'boolean', label: 'Show vertical axis', default: defaults.showVerticalAxis ?? true },
    { key: 'verticalAxisDirection', type: 'select', label: 'Vertical axis side', default: 'left', choices: [{ value: 'left', text: 'Left' }, { value: 'right', text: 'Right' }] },
    { key: 'showVerticalTicks', type: 'boolean', label: 'Show vertical ticks', default: defaults.showVerticalTicks },
    { key: 'verticalLabelPosition', type: 'select', label: 'Vertical labels', default: 'auto', choices: LABEL_POSITION_CHOICES },
    { key: 'verticalGridStyle', type: 'select', label: 'Vertical grid style', default: defaults.verticalGrid, choices: GRID_STYLE_CHOICES },
    { key: 'verticalNumberFormat', type: 'numberFormat', label: 'Vertical number format' },
    ...(defaults.valueAxis === 'vertical'
      ? [
          { key: 'verticalScaleType', type: 'select' as const, label: 'Vertical scale', default: 'linear', choices: SCALE_TYPE_CHOICES },
          { key: 'verticalRangeMin', type: 'text' as const, label: 'Vertical min', placeholder: 'auto' },
          { key: 'verticalRangeMax', type: 'text' as const, label: 'Vertical max', placeholder: 'auto' },
        ]
      : []),
    { key: 'showHorizontalAxis', type: 'boolean', label: 'Show horizontal axis', default: true },
    { key: 'showHorizontalTicks', type: 'boolean', label: 'Show horizontal ticks', default: defaults.showHorizontalTicks },
    { key: 'horizontalLabelPosition', type: 'select', label: 'Horizontal labels', default: 'auto', choices: LABEL_POSITION_CHOICES },
    { key: 'horizontalGridStyle', type: 'select', label: 'Horizontal grid style', default: defaults.horizontalGrid, choices: GRID_STYLE_CHOICES },
    { key: 'horizontalNumberFormat', type: 'numberFormat', label: 'Horizontal number format' },
    ...(defaults.valueAxis === 'horizontal'
      ? [
          { key: 'horizontalScaleType', type: 'select' as const, label: 'Horizontal scale', default: 'linear', choices: SCALE_TYPE_CHOICES },
          { key: 'horizontalRangeMin', type: 'text' as const, label: 'Horizontal min', placeholder: 'auto' },
          { key: 'horizontalRangeMax', type: 'text' as const, label: 'Horizontal max', placeholder: 'auto' },
        ]
      : []),
    ...(defaults.horizontalRange
      ? [
          { key: 'horizontalRangeMin', type: 'text' as const, label: 'Horizontal min', placeholder: 'auto' },
          { key: 'horizontalRangeMax', type: 'text' as const, label: 'Horizontal max', placeholder: 'auto' },
        ]
      : []),
  ]
}

// Vertical bars: value axis is vertical → horizontal dashed grid, no vertical grid, no ticks on category axis, no vertical axis line
const barVerticalAxisOpts = axisOpts({ verticalGrid: 'dashed', horizontalGrid: 'none', showVerticalTicks: false, showHorizontalTicks: false, showVerticalAxis: false, valueAxis: 'vertical' })

// Horizontal bars: value axis is horizontal → vertical dashed grid, no horizontal grid, no ticks on category axis
const barHorizontalAxisOpts = axisOpts({ verticalGrid: 'none', horizontalGrid: 'dashed', showVerticalTicks: false, showHorizontalTicks: false, valueAxis: 'horizontal' })

// Lines: value axis is vertical → horizontal dashed grid, no vertical grid, no vertical axis line
const lineAxisOpts = axisOpts({ verticalGrid: 'dashed', horizontalGrid: 'none', showVerticalTicks: false, showHorizontalTicks: false, showVerticalAxis: false, valueAxis: 'vertical', horizontalRange: true })

// Per-chart-type option overrides based on dataviz best practices (HANDBOOK.md)
// Line charts: monotone interpolation is smooth and non-distorting (preferred over linear for general use)
const lineInterpolationOpt: ChartOptionDef = { ...interpolationOpt, default: 'monotoneX' }
// Line charts: vertical crosshair is standard for time-series data
const lineCrosshairDirectionOpt: ChartOptionDef = { ...crosshairDirectionOpt, default: 'vertical' }
// Multi-line: direct labeling preferred over legends ("label lines directly instead of using a legend")
const lineMultiDirectLabellingOpt: ChartOptionDef = { ...directLabellingOpt, default: 'auto' }
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

registerChart('bar-vertical', barVertical, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, swapLabelValueOpt, barBackgroundOpt, barSeparatorsOpt, waterfallOpt, waterfallTotalOpt, ...barVerticalAxisOpts, ...barOpts])
registerChart('bar-horizontal', barHorizontal, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, swapLabelValueOpt, barBackgroundOpt, barSeparatorsOpt, waterfallOpt, waterfallTotalOpt, ...barHorizontalAxisOpts, ...barHorizontalOpts])
registerChart('bar-multi', barMulti, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, sortModeOpt, legendOpt, legendAnchorOpt, legendPositionOpt, directLabellingOpt, directLabelAnchorOpt, ...barVerticalAxisOpts, ...barOpts])
registerChart('line', line, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, lineInterpolationOpt, edgePaddingOpt, ...lineAxisOpts, ...lineOpts])
registerChart('line-multi', lineMulti, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, lineInterpolationOpt, edgePaddingOpt, sortModeOpt, legendOpt, legendAnchorOpt, legendPositionOpt, lineMultiDirectLabellingOpt, ...lineAxisOpts, ...lineOpts])
registerChart('donut', donut, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, legendOpt, legendAnchorOpt, legendPositionOpt, directLabellingOpt, tooltipsOpt, ...donutArcOpts])
registerChart('pie', pie, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, legendOpt, legendAnchorOpt, legendPositionOpt, directLabellingOpt, tooltipsOpt, ...pieArcOpts])

// Area: same axis options as line, same interaction options
registerChart('area', area, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, lineInterpolationOpt, edgePaddingOpt, ...lineAxisOpts, ...lineOpts])

// Stacked area: multi-series with legend + stack mode
const areaStackedAxisOpts = axisOpts({ verticalGrid: 'dashed', horizontalGrid: 'none', showVerticalTicks: false, showHorizontalTicks: false, showVerticalAxis: false, valueAxis: 'vertical', horizontalRange: true })
registerChart('area-stacked', areaStacked, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, lineInterpolationOpt, edgePaddingOpt, stackModeOpt, legendOpt, legendAnchorOpt, legendPositionOpt, directLabellingOpt, ...areaStackedAxisOpts, tooltipsOpt, ...lineCrosshairOpts])

// Stacked column: vertical bars stacked
registerChart('column-stacked', columnStacked, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, stackModeOpt, sortModeOpt, legendOpt, legendAnchorOpt, legendPositionOpt, directLabellingOpt, directLabelAnchorOpt, ...barVerticalAxisOpts, ...barOpts])

// Stacked bar: horizontal bars stacked
registerChart('bar-stacked', barStacked, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, stackModeOpt, sortModeOpt, legendOpt, legendAnchorOpt, legendPositionOpt, directLabellingOpt, directLabelAnchorOpt, ...barHorizontalAxisOpts, ...barHorizontalOpts])

// Aliases share the same entry
registerChart('vertical-bar', barVertical, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, swapLabelValueOpt, barBackgroundOpt, barSeparatorsOpt, waterfallOpt, waterfallTotalOpt, ...barVerticalAxisOpts, ...barOpts])
registerChart('horizontal-bar', barHorizontal, [colorsOpt, paletteOpt, autoContrastOpt, allowDarkModeOpt, swapLabelValueOpt, barBackgroundOpt, barSeparatorsOpt, waterfallOpt, waterfallTotalOpt, ...barHorizontalAxisOpts, ...barHorizontalOpts])
