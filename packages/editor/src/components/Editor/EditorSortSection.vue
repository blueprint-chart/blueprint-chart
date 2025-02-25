<template>
  <FormControlButtonGroup
    v-model="sort"
    label="Sort"
    :options="sortOptions"
    block
  />
</template>

<script setup lang="ts">
import { FormControlButtonGroup } from '@blueprint-chart/ui'
import { useChartConfig } from '@/composables/useChartConfig'

const { sort } = useChartConfig()

const sortOptions = [
  { value: 'none', text: 'None' },
  { value: 'ascending', text: 'Ascending' },
  { value: 'descending', text: 'Descending' },
]
</script>
