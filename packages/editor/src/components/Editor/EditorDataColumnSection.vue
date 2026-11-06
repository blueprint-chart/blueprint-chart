<script setup lang="ts">
import { useChartConfig } from '@/stores/chartConfig'
import { useDataTable } from '@/stores/dataTable'

const { selectedColumn } = useChartConfig()
const dataTable = useDataTable()

const valueColumns = computed(() => dataTable.columns.value.slice(1))

const columnChoices = computed(() => valueColumns.value.map(c => ({ value: c, text: c })))

const column = computed({
  get: () => valueColumns.value.includes(selectedColumn.value) ? selectedColumn.value : valueColumns.value[0],
  set: (value: string) => {
    selectedColumn.value = value
  },
})
</script>

<template>
  <BFormGroup
    label="Data column"
    label-for="column-select"
  >
    <BFormSelect
      id="column-select"
      v-model="column"
      :options="columnChoices"
    />
  </BFormGroup>
</template>
