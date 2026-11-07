<template>
  <div class="d-flex flex-column gap-3">
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
    <BFormGroup
      v-if="showSortSeries"
      label="Sort by series"
      label-for="opt-sort-series"
    >
      <BFormSelect
        id="opt-sort-series"
        :model-value="sortSeries"
        :options="seriesNames"
        @update:model-value="value => setOption('sortSeries', String(value ?? ''))"
      />
    </BFormGroup>
    <FormControlCheckbox
      v-if="availableOptionKeys.includes('sortReverse')"
      :model-value="currentOptions.sortReverse ?? false"
      label="Reverse order"
      @update:model-value="value => setOption('sortReverse', value)"
    />
  </div>
</template>

<script setup lang="ts">
import { FormControlButtonGroup, FormControlCheckbox } from '@blueprint-chart/ui'
import { SortDirection, SortMode, parseData } from '@blueprint-chart/lib'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import IPhEquals from '~icons/ph/equals'
import IPhSortAscending from '~icons/ph/sort-ascending'
import IPhSortDescending from '~icons/ph/sort-descending'

const { sort, data } = useChartConfig()
const { currentOptions, availableOptionKeys, optionDefs, setOption } = useChartTypeOptions()

const hasSortMode = computed(() => availableOptionKeys.value.includes('sortMode'))
const sortModeDef = computed(() => optionDefs.value.find(def => def.key === 'sortMode'))
const sortMode = computed(() => currentOptions.value.sortMode ?? SortMode.None)

const seriesNames = computed(() => parseData(data.value).series?.map(s => s.name) ?? [])
const showSortSeries = computed(() => availableOptionKeys.value.includes('sortSeries') && sortMode.value === SortMode.Series)
const sortSeries = computed(() => seriesNames.value.includes(currentOptions.value.sortSeries ?? '') ? currentOptions.value.sortSeries : seriesNames.value[0])

const sortOptions = [
  { value: SortDirection.None, text: 'None', icon: IPhEquals },
  { value: SortDirection.Ascending, text: 'Ascending', icon: IPhSortAscending },
  { value: SortDirection.Descending, text: 'Descending', icon: IPhSortDescending },
]

const sortModeOptions = computed(() => (sortModeDef.value?.choices ?? []).map(({ value, text }) => ({
  value,
  text,
  icon: value === SortMode.None ? IPhEquals : IPhSortAscending,
})))
</script>
