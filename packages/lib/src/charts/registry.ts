import type { ChartOptionDef, ChartRenderer } from './types'
import { listPalettes } from './palettes'
import { render as barVertical } from './types/bar-vertical/bar-vertical'
import { render as barHorizontal } from './types/bar-horizontal/bar-horizontal'
import { render as barMulti } from './types/bar-multi/bar-multi'
import { render as line } from './types/line/line'
import { render as lineMulti } from './types/line-multi/line-multi'
import { render as donut } from './types/donut/donut'
import { render as pie } from './types/pie/pie'

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
    { key: 'verticalNumberFormat', type: 'text', label: 'Vertical number format', placeholder: ',.0f' },
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
    { key: 'horizontalNumberFormat', type: 'text', label: 'Horizontal format', placeholder: '%b %Y, ,.0f' },
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

// Register all chart types
const crosshairOpts = [crosshairOpt, crosshairDirectionOpt, crosshairStyleOpt, crosshairColorOpt]
const barOpts = [valueLabelsOpt, valueLabelPositionOpt, tooltipsOpt, ...crosshairOpts]
const lineSymbolOpts = [lineSymbolsOpt, lineSymbolShapeOpt, lineSymbolShowOnOpt, lineSymbolStyleOpt, lineSymbolSizeOpt, lineSymbolOpacityOpt]
const lineOpts = [valueLabelsOpt, valueLabelPositionOpt, tooltipsOpt, ...crosshairOpts, ...lineSymbolOpts]

registerChart('bar-vertical', barVertical, [colorsOpt, paletteOpt, autoContrastOpt, ...barVerticalAxisOpts, ...barOpts])
registerChart('bar-horizontal', barHorizontal, [colorsOpt, paletteOpt, autoContrastOpt, ...barHorizontalAxisOpts, ...barOpts])
registerChart('bar-multi', barMulti, [colorsOpt, paletteOpt, autoContrastOpt, sortModeOpt, legendOpt, legendAnchorOpt, legendPositionOpt, directLabellingOpt, directLabelAnchorOpt, ...barVerticalAxisOpts, ...barOpts])
registerChart('line', line, [colorsOpt, paletteOpt, autoContrastOpt, interpolationOpt, ...lineAxisOpts, ...lineOpts])
registerChart('line-multi', lineMulti, [colorsOpt, paletteOpt, autoContrastOpt, interpolationOpt, sortModeOpt, legendOpt, legendAnchorOpt, legendPositionOpt, directLabellingOpt, ...lineAxisOpts, ...lineOpts])
const arcOpts = [displayAsPercentageOpt, showTotalOpt, showLabelsOpt, showValuesOpt, sliceMaxOpt, sliceGroupLabelOpt]
registerChart('donut', donut, [colorsOpt, paletteOpt, autoContrastOpt, legendOpt, legendAnchorOpt, legendPositionOpt, directLabellingOpt, tooltipsOpt, ...arcOpts])
registerChart('pie', pie, [colorsOpt, paletteOpt, autoContrastOpt, legendOpt, legendAnchorOpt, legendPositionOpt, directLabellingOpt, tooltipsOpt, ...arcOpts])

// Aliases share the same entry
registerChart('vertical-bar', barVertical, [colorsOpt, paletteOpt, autoContrastOpt, ...barVerticalAxisOpts, ...barOpts])
registerChart('horizontal-bar', barHorizontal, [colorsOpt, paletteOpt, autoContrastOpt, ...barHorizontalAxisOpts, ...barOpts])
