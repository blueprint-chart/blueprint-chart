<template>
  <BFormGroup
    label="Chart type"
    label-for="chart-type-select"
  >
    <BFormSelect
      id="chart-type-select"
      v-model="chartType"
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
import { computed, watch } from 'vue'
import { useChartConfig } from '@/composables/useChartConfig'
import { useDataTable } from '@/composables/useDataTable'

const { chartType, selectedColumn } = useChartConfig()
const dataTable = useDataTable()

const chartTypeOptions = [
  { value: 'bar-vertical', text: 'Bar (Vertical)' },
  { value: 'bar-horizontal', text: 'Bar (Horizontal)' },
  { value: 'bar-multi', text: 'Bar (Multi)' },
  { value: 'line', text: 'Line' },
  { value: 'line-multi', text: 'Line (Multi)' },
  { value: 'donut', text: 'Donut' },
  { value: 'pie', text: 'Pie' },
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
