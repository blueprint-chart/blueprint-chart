<template>
  <FormControlButtonGroup
    v-if="isMultiChart"
    v-model="sortMode"
    label="Sort mode"
    :options="sortModeOptions"
    block
  />
  <FormControlButtonGroup
    v-else
    v-model="sort"
    label="Sort"
    :options="sortOptions"
    block
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FormControlButtonGroup } from '@blueprint-chart/ui'
import { useChartConfig } from '@/composables/useChartConfig'

const { sort, sortMode, chartType } = useChartConfig()

const isMultiChart = computed(() => {
  return chartType.value === 'bar-multi' || chartType.value === 'line-multi'
})

const sortOptions = [
  { value: 'none', text: 'None' },
  { value: 'ascending', text: 'Ascending' },
  { value: 'descending', text: 'Descending' },
]

const sortModeOptions = [
  { value: 'none', text: 'None' },
  { value: 'total', text: 'By total' },
  { value: 'within-groups', text: 'Within groups' },
]
</script>
