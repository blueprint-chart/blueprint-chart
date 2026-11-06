import { markRaw, type Component } from 'vue'
import { ChartType } from '@blueprint-chart/lib'
import { getChartTypeLabel } from '@blueprint-chart/ui'

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

export const CHART_TYPE_THUMBNAILS: Record<string, Component> = {
  [ChartType.BarVertical]: markRaw(BarVerticalThumb),
  [ChartType.BarHorizontal]: markRaw(BarHorizontalThumb),
  [ChartType.BarMulti]: markRaw(BarMultiThumb),
  [ChartType.BarGrouped]: markRaw(BarGroupedThumb),
  [ChartType.BarSplit]: markRaw(BarSplitThumb),
  [ChartType.ColumnStacked]: markRaw(ColumnStackedThumb),
  [ChartType.BarStacked]: markRaw(BarStackedThumb),
  [ChartType.Pie]: markRaw(PieThumb),
  [ChartType.Donut]: markRaw(DonutThumb),
  [ChartType.Line]: markRaw(LineThumb),
  [ChartType.LineMulti]: markRaw(LineMultiThumb),
  [ChartType.Area]: markRaw(AreaThumb),
  [ChartType.AreaStacked]: markRaw(AreaStackedThumb),
  [ChartType.Scatter]: markRaw(ScatterThumb),
}

export interface ChartTypeChoice {
  value: string
  label: string
  visual: Component
}

export interface ChartTypeGroup {
  title: string
  choices: ChartTypeChoice[]
}

function choices(...types: ChartType[]): ChartTypeChoice[] {
  return types.map(value => ({ value, label: getChartTypeLabel(value), visual: CHART_TYPE_THUMBNAILS[value] }))
}

export const CHART_TYPE_GROUPS: ChartTypeGroup[] = [
  {
    title: 'Compare categories',
    choices: choices(ChartType.BarVertical, ChartType.BarHorizontal, ChartType.BarMulti, ChartType.BarGrouped, ChartType.BarSplit),
  },
  {
    title: 'Parts of a whole',
    choices: choices(ChartType.ColumnStacked, ChartType.BarStacked, ChartType.Pie, ChartType.Donut),
  },
  {
    title: 'Change over time',
    choices: choices(ChartType.Line, ChartType.LineMulti, ChartType.Area, ChartType.AreaStacked),
  },
  {
    title: 'Relationships',
    choices: choices(ChartType.Scatter),
  },
]
