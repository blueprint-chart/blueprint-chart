<template>
  <div
    class="data-check-table"
    :class="themeClass"
  >
    <hot-table
      ref="hotRef"
      :data="tableData"
      :col-headers="colHeaders"
      :columns="hotColumns"
      :row-headers="true"
      :height="400"
      :auto-wrap-row="true"
      :auto-wrap-col="true"
      :context-menu="['row_above', 'row_below', 'remove_row', '---------', 'undo', 'redo']"
      :undo="true"
      :manual-column-resize="true"
      :manual-row-resize="true"
      stretch-h="all"
      license-key="non-commercial-and-evaluation"
      @after-change="handleChange"
      @after-remove-row="handleRemoveRow"
      @after-create-row="handleCreateRow"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { HotTable } from '@handsontable/vue3'
import { registerAllModules } from 'handsontable/registry'
import 'handsontable/styles/handsontable.min.css'
import 'handsontable/styles/ht-theme-main.min.css'
import { useDataTable } from '@/composables/useDataTable'
import { useTheme } from '@/composables/useTheme'
import type { ColumnType } from '@/composables/useDataParser'

registerAllModules()

const { theme } = useTheme()
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
const isDark = computed(() => {
  if (theme.value === 'dark') {
    return true
  }
  if (theme.value === 'auto') {
    return prefersDark.value
  }
  return false
})

const themeClass = computed(() => ({
  'ht-theme-main-dark': isDark.value,
}))

const hotRef = ref<InstanceType<typeof HotTable> | null>(null)

const { columns, rows, columnTypes, renameColumn, updateCell, deleteRow } = useDataTable()

const colHeaders = computed(() => [...columns.value])

function hotColumnType(ct: ColumnType): string {
  if (ct === 'number') {
    return 'numeric'
  }
  if (ct === 'date') {
    return 'date'
  }
  return 'text'
}

const hotColumns = computed(() =>
  columns.value.map((_, ci) => {
    const ct = columnTypes.value[ci] ?? 'string'
    const base: Record<string, unknown> = { type: hotColumnType(ct) }
    if (ct === 'date') {
      base.dateFormat = 'YYYY-MM-DD'
      base.correctFormat = false
    }
    return base
  }),
)

const tableData = computed(() =>
  rows.value.map(row => [...row]),
)

let syncing = false

function handleChange(changes: Array<[number, number | string, unknown, unknown]> | null) {
  if (!changes || syncing) {
    return
  }
  syncing = true
  for (const [row, col, , newVal] of changes) {
    const ci = typeof col === 'string' ? columns.value.indexOf(col) : col
    if (ci >= 0) {
      updateCell(row, ci, String(newVal ?? ''))
    }
  }
  syncing = false
}

function handleRemoveRow(index: number, amount: number) {
  if (syncing) {
    return
  }
  syncing = true
  for (let i = amount - 1; i >= 0; i--) {
    deleteRow(index + i)
  }
  syncing = false
}

function handleCreateRow(index: number, amount: number) {
  if (syncing) {
    return
  }
  syncing = true
  const colCount = columns.value.length
  for (let i = 0; i < amount; i++) {
    rows.value.splice(index + i, 0, Array.from({ length: colCount }, () => ''))
  }
  syncing = false
}

function columnFingerprint() {
  return columns.value.map((c, i) => `${c}:${columnTypes.value[i]}`).join(',')
}

function syncTableSettings() {
  nextTick(() => {
    const hot = hotRef.value?.hotInstance
    if (hot && !hot.isDestroyed) {
      hot.updateSettings({
        colHeaders: [...columns.value],
        columns: hotColumns.value,
      })
    }
  })
}

watch(columnFingerprint, syncTableSettings)

defineExpose({
  renameColumn,
})
</script>

<style scoped>
.data-check-table {
  overflow: auto;
}

.data-check-table :deep(.handsontable th) {
  font-weight: 600;
}
</style>
