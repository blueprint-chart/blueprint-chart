<template>
  <BFormGroup
    label="Chart type"
    label-for="chart-type-select"
  >
    <FormControlDropdown
      id="chart-type-select"
      v-model="chartType"
      block
      :options="chartTypeOptions"
    />
  </BFormGroup>

  <BFormGroup
    v-if="showColumnPicker"
    label="Data column"
    label-for="column-select"
    class="mt-3"
  >
    <BFormSelect
      id="column-select"
      v-model="selectedColumn"
      :options="columnChoices"
    />
  </BFormGroup>

  <BFormGroup
    v-if="hasStack"
    label="Stack mode"
    label-for="opt-stack-mode"
    class="mt-3"
  >
    <BFormSelect
      id="opt-stack-mode"
      :model-value="currentOptions.stackMode ?? 'normal'"
      :options="stackModeChoices"
      @update:model-value="(v) => setOption('stackMode', String(v ?? ''))"
    />
  </BFormGroup>
</template>

<script setup lang="ts">
import { FormControlDropdown } from '@blueprint-chart/ui'
import { ChartType } from '@blueprint-chart/lib'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import { useDataTable } from '@/stores/dataTable'

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

const { chartType, selectedColumn } = useChartConfig()
const { currentOptions, availableOptionKeys, setOption } = useChartTypeOptions()
const dataTable = useDataTable()

const hasStack = computed(() => availableOptionKeys.value.includes('stackMode'))

const stackModeChoices = [
  { value: 'normal', text: 'Normal' },
  { value: 'percent', text: 'Percentage (100%)' },
]

const chartTypeOptions = [
  { value: ChartType.BarVertical, label: 'Columns', description: 'Compare values across categories', visual: markRaw(BarVerticalThumb) },
  { value: ChartType.BarHorizontal, label: 'Bars', description: 'Compare values with long labels', visual: markRaw(BarHorizontalThumb) },
  { value: ChartType.BarMulti, label: 'Grouped Columns', description: 'Compare multiple series side by side', visual: markRaw(BarMultiThumb) },
  { value: ChartType.ColumnStacked, label: 'Stacked Columns', description: 'Compare stacked totals', visual: markRaw(ColumnStackedThumb) },
  { value: ChartType.BarStacked, label: 'Stacked Bars', description: 'Compare stacked totals horizontally', visual: markRaw(BarStackedThumb) },
  { value: ChartType.BarSplit, label: 'Split Bars', description: 'Compare multiple metrics in separate bar panels', visual: markRaw(BarSplitThumb) },
  { value: ChartType.BarGrouped, label: 'Grouped Bars', description: 'Compare multiple series side by side horizontally', visual: markRaw(BarGroupedThumb) },
  { value: ChartType.Line, label: 'Line', description: 'Show trends over time', visual: markRaw(LineThumb) },
  { value: ChartType.LineMulti, label: 'Lines', description: 'Compare trends across series', visual: markRaw(LineMultiThumb) },
  { value: ChartType.Area, label: 'Area', description: 'Show magnitude over time', visual: markRaw(AreaThumb) },
  { value: ChartType.AreaStacked, label: 'Areas', description: 'Compare and stack multiple area series', visual: markRaw(AreaStackedThumb) },
  { value: ChartType.Donut, label: 'Donut', description: 'Show proportions with a center space', visual: markRaw(DonutThumb) },
  { value: ChartType.Pie, label: 'Pie', description: 'Show parts of a whole', visual: markRaw(PieThumb) },
]

const singleSeriesTypes: string[] = [ChartType.BarVertical, ChartType.BarHorizontal, ChartType.Line, ChartType.Area, ChartType.VerticalBar, ChartType.HorizontalBar]

const showColumnPicker = computed(() => {
  return singleSeriesTypes.includes(chartType.value) && dataTable.columns.value.length > 2
})

const columnChoices = computed(() => {
  return dataTable.columns.value.slice(1).map(c => ({ value: c, text: c }))
})

watch([chartType, () => dataTable.columns.value], () => {
  if (showColumnPicker.value && !selectedColumn.value && dataTable.columns.value.length > 2) {
    selectedColumn.value = dataTable.columns.value[1]
  }
}, { immediate: true })
</script>
