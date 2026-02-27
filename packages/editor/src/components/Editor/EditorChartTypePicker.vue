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
</template>

<script setup lang="ts">
import { computed, watch, markRaw } from 'vue'
import { FormControlDropdown } from '@blueprint-chart/ui'
import { useChartConfig } from '@/composables/useChartConfig'
import { useDataTable } from '@/composables/useDataTable'

import BarVerticalThumb from '@/assets/chart-thumbnails/bar-vertical.bpc'
import BarHorizontalThumb from '@/assets/chart-thumbnails/bar-horizontal.bpc'
import BarMultiThumb from '@/assets/chart-thumbnails/bar-multi.bpc'
import LineThumb from '@/assets/chart-thumbnails/line.bpc'
import LineMultiThumb from '@/assets/chart-thumbnails/line-multi.bpc'
import DonutThumb from '@/assets/chart-thumbnails/donut.bpc'
import PieThumb from '@/assets/chart-thumbnails/pie.bpc'

const { chartType, selectedColumn } = useChartConfig()
const dataTable = useDataTable()

const chartTypeOptions = [
  { value: 'bar-vertical', label: 'Bar (Vertical)', description: 'Compare values across categories', visual: markRaw(BarVerticalThumb) },
  { value: 'bar-horizontal', label: 'Bar (Horizontal)', description: 'Compare values with long labels', visual: markRaw(BarHorizontalThumb) },
  { value: 'bar-multi', label: 'Bar (Multi)', description: 'Compare multiple series side by side', visual: markRaw(BarMultiThumb) },
  { value: 'line', label: 'Line', description: 'Show trends over time', visual: markRaw(LineThumb) },
  { value: 'line-multi', label: 'Line (Multi)', description: 'Compare trends across series', visual: markRaw(LineMultiThumb) },
  { value: 'donut', label: 'Donut', description: 'Show proportions with a center space', visual: markRaw(DonutThumb) },
  { value: 'pie', label: 'Pie', description: 'Show parts of a whole', visual: markRaw(PieThumb) },
]

const singleSeriesTypes = ['bar-vertical', 'bar-horizontal', 'line', 'vertical-bar', 'horizontal-bar']

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
