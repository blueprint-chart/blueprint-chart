<script setup lang="ts">
import { useChartConfig } from '@/stores/chartConfig'
import { useDataTable } from '@/stores/dataTable'

const { chartType, selectedColumn } = useChartConfig()
const dataTable = useDataTable()

const columnChoices = computed(() => {
  return dataTable.columns.value.slice(1).map(c => ({ value: c, text: c }))
})

watch([chartType, () => dataTable.columns.value], () => {
  if (!selectedColumn.value && columnChoices.value.length > 0) {
    selectedColumn.value = columnChoices.value[0].value
  }
}, { immediate: true })
</script>

<template>
  <BFormGroup
    label="Data column"
    label-for="column-select"
  >
    <BFormSelect
      id="column-select"
      v-model="selectedColumn"
      :options="columnChoices"
    />
  </BFormGroup>
</template>
