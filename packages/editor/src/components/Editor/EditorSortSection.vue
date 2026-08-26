<template>
  <FormControlButtonGroup
    v-if="hasSortMode"
    :model-value="sortMode"
    label="Sort mode"
    :options="sortModeOptions"
    block
    @update:model-value="value => setOption('sortMode', value as SortMode)"
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
import { SortDirection, SortMode } from '@blueprint-chart/lib'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import IPhEquals from '~icons/ph/equals'
import IPhSortAscending from '~icons/ph/sort-ascending'
import IPhSortDescending from '~icons/ph/sort-descending'

const { sort } = useChartConfig()
const { currentOptions, availableOptionKeys, setOption } = useChartTypeOptions()

const hasSortMode = computed(() => availableOptionKeys.value.includes('sortMode'))
const sortMode = computed(() => currentOptions.value.sortMode ?? SortMode.None)

const sortOptions = [
  { value: SortDirection.None, text: 'None', icon: IPhEquals },
  { value: SortDirection.Ascending, text: 'Ascending', icon: IPhSortAscending },
  { value: SortDirection.Descending, text: 'Descending', icon: IPhSortDescending },
]

const sortModeOptions = [
  { value: SortMode.None, text: 'None', icon: IPhEquals },
  { value: SortMode.Total, text: 'By total', icon: IPhSortAscending },
  { value: SortMode.WithinGroups, text: 'Within groups', icon: IPhSortAscending },
]
</script>
