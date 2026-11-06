import { markRaw, type Component } from 'vue'
import { ChartType } from '@blueprint-chart/lib'

import BarVerticalThumb from '@/assets/chart-thumbnails/bar-vertical.bpc'
import BarHorizontalThumb from '@/assets/chart-thumbnails/bar-horizontal.bpc'
import BarMultiThumb from '@/assets/chart-thumbnails/bar-multi.bpc'
import LineThumb from '@/assets/chart-thumbnails/line.bpc'
import LineMultiThumb from '@/assets/chart-thumbnails/line-multi.bpc'
import AreaThumb from '@/assets/chart-thumbnails/area.bpc'
import AreaStackedThumb from '@/assets/chart-thumbnails/area-stacked.bpc'
import ColumnStackedThumb from '@/assets/chart-thumbnails/column-stacked.bpc'
import BarStackedThumb from '@/assets/chart-thumbnails/bar-stacked.bpc'
import BarSplitThumb from '@/assets/chart-thumbnails/bar-split.bpc'
import BarGroupedThumb from '@/assets/chart-thumbnails/bar-grouped.bpc'
import DonutThumb from '@/assets/chart-thumbnails/donut.bpc'
import PieThumb from '@/assets/chart-thumbnails/pie.bpc'
import ScatterThumb from '@/assets/chart-thumbnails/scatter.bpc'

export interface ChartTypeChoice {
  value: string
  label: string
  visual: Component
}

export interface ChartTypeGroup {
  title: string
  choices: ChartTypeChoice[]
}

export const CHART_TYPE_GROUPS: ChartTypeGroup[] = [
  {
    title: 'Compare categories',
    choices: [
      { value: ChartType.BarVertical, label: 'Columns', visual: markRaw(BarVerticalThumb) },
      { value: ChartType.BarHorizontal, label: 'Bars', visual: markRaw(BarHorizontalThumb) },
      { value: ChartType.BarMulti, label: 'Grouped columns', visual: markRaw(BarMultiThumb) },
      { value: ChartType.BarGrouped, label: 'Grouped bars', visual: markRaw(BarGroupedThumb) },
      { value: ChartType.BarSplit, label: 'Split bars', visual: markRaw(BarSplitThumb) },
    ],
  },
  {
    title: 'Parts of a whole',
    choices: [
      { value: ChartType.ColumnStacked, label: 'Stacked columns', visual: markRaw(ColumnStackedThumb) },
      { value: ChartType.BarStacked, label: 'Stacked bars', visual: markRaw(BarStackedThumb) },
      { value: ChartType.Pie, label: 'Pie', visual: markRaw(PieThumb) },
      { value: ChartType.Donut, label: 'Donut', visual: markRaw(DonutThumb) },
    ],
  },
  {
    title: 'Change over time',
    choices: [
      { value: ChartType.Line, label: 'Line', visual: markRaw(LineThumb) },
      { value: ChartType.LineMulti, label: 'Lines', visual: markRaw(LineMultiThumb) },
      { value: ChartType.Area, label: 'Area', visual: markRaw(AreaThumb) },
      { value: ChartType.AreaStacked, label: 'Areas', visual: markRaw(AreaStackedThumb) },
    ],
  },
  {
    title: 'Relationships',
    choices: [
      { value: ChartType.Scatter, label: 'Scatter', visual: markRaw(ScatterThumb) },
    ],
  },
]
