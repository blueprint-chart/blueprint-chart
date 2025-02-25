<template>
  <div class="container py-4">
    <h5 class="mb-3">
      Review your data
    </h5>
    <p class="text-muted small mb-3">
      {{ columns.length }} columns, {{ rows.length }} rows
    </p>
    <div
      v-if="columnTypes.length > 0"
      class="mb-3 d-flex flex-wrap gap-2"
    >
      <span
        v-for="(col, ci) in columns"
        :key="ci"
        class="badge"
        :class="typeBadgeClass(columnTypes[ci])"
      >
        {{ col }}: {{ columnTypes[ci] ?? 'string' }}
      </span>
    </div>
    <DataCheckTable />
  </div>
</template>

<script setup lang="ts">
import { useDataTable } from '@/composables/useDataTable'
import DataCheckTable from './DataCheckTable.vue'
import type { ColumnType } from '@/composables/useDataParser'

const { columns, rows, columnTypes } = useDataTable()

function typeBadgeClass(ct: ColumnType | undefined): string {
  if (ct === 'number') return 'bg-primary'
  if (ct === 'date') return 'bg-success'
  return 'bg-secondary'
}
</script>
