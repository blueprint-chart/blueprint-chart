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
</template>

<script setup lang="ts">
import { useChartConfig } from '@/composables/useChartConfig'

const { chartType } = useChartConfig()

const chartTypeOptions = [
  { value: 'bar-vertical', text: 'Bar (Vertical)' },
  { value: 'bar-horizontal', text: 'Bar (Horizontal)' },
  { value: 'bar-multi', text: 'Bar (Multi)' },
  { value: 'line', text: 'Line' },
  { value: 'line-multi', text: 'Line (Multi)' },
  { value: 'donut', text: 'Donut' },
  { value: 'pie', text: 'Pie' },
]
</script>
