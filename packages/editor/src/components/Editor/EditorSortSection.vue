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
import { FormControlButtonGroup } from '@blueprint-chart/ui'
import { ChartType, SortDirection } from '@blueprint-chart/lib'
import { useChartConfig } from '@/stores/chartConfig'
import IPhEquals from '~icons/ph/equals'
import IPhSortAscending from '~icons/ph/sort-ascending'
import IPhSortDescending from '~icons/ph/sort-descending'

const { sort, sortMode, chartType } = useChartConfig()

const isMultiChart = computed(() => {
  return chartType.value === ChartType.BarMulti || chartType.value === ChartType.LineMulti
})

const sortOptions = [
  { value: SortDirection.None, text: 'None', icon: IPhEquals },
  { value: SortDirection.Ascending, text: 'Ascending', icon: IPhSortAscending },
  { value: SortDirection.Descending, text: 'Descending', icon: IPhSortDescending },
]

const sortModeOptions = [
  { value: 'none', text: 'None', icon: IPhEquals },
  { value: 'total', text: 'By total', icon: IPhSortAscending },
  { value: 'within-groups', text: 'Within groups', icon: IPhSortAscending },
]
</script>
