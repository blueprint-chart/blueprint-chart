<template>
  <div
    v-if="isEmpty"
    class="data-check-empty"
  >
    <IPhMagnifyingGlass class="data-check-empty-icon" />
    <p>No rows match your filters</p>
  </div>
  <div
    v-else
    class="data-check-table"
  >
    <hot-table
      ref="hotRef"
      :data="tableData"
      :col-headers="colHeaders"
      :columns="hotColumns"
      :row-headers="true"
      :height="'auto'"
      :auto-row-size="true"
      :auto-wrap-row="true"
      :auto-wrap-col="true"
      :theme-name="themeName"
      :context-menu="hasTransforms ? false : ['row_above', 'row_below', 'remove_row', '---------', 'undo', 'redo']"
      :undo="true"
      :manual-column-resize="true"
      :manual-row-resize="true"
      stretch-h="all"
      license-key="non-commercial-and-evaluation"
      :after-change="handleChange"
      :after-remove-row="handleRemoveRow"
      :after-create-row="handleCreateRow"
      :after-on-cell-mouse-down="handleCellMouseDown"
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
import { useEditorPanel } from '@/composables/useEditorPanel'
import type { ColumnType } from '@/composables/useDataParser'
import IPhMagnifyingGlass from '~icons/ph/magnifying-glass'

registerAllModules()

const { theme } = useTheme()
const { selectColumn } = useEditorPanel()
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

const themeName = computed(() =>
  isDark.value ? 'ht-theme-main-dark' : 'ht-theme-main',
)

const hotRef = ref<InstanceType<typeof HotTable> | null>(null)

const { columns, rows, displayColumns, displayRows, displayColumnTypes, hasTransforms, renameColumn, updateCell, deleteRow } = useDataTable()

const colHeaders = computed(() => [...displayColumns.value])

const isEmpty = computed(() => displayRows.value.length === 0)

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
  displayColumns.value.map((_, ci) => {
    const ct = displayColumnTypes.value[ci] ?? 'string'
    const base: Record<string, unknown> = { type: hotColumnType(ct), readOnly: hasTransforms.value }
    if (ct === 'date') {
      base.dateFormat = 'YYYY-MM-DD'
      base.correctFormat = false
    }
    return base
  }),
)

const tableData = computed(() =>
  displayRows.value.map(row => [...row]),
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

function handleCellMouseDown(_event: MouseEvent, coords: { row: number, col: number }) {
  if (coords.row < 0 && coords.col >= 0) {
    selectColumn(coords.col)
  }
}

function columnFingerprint() {
  return displayColumns.value.map((c, i) => `${c}:${displayColumnTypes.value[i]}`).join(',')
}

function syncTableSettings() {
  nextTick(() => {
    const hot = hotRef.value?.hotInstance
    if (hot && !hot.isDestroyed) {
      hot.updateSettings({
        colHeaders: [...displayColumns.value],
        columns: hotColumns.value,
      })
    }
  })
}

watch(columnFingerprint, syncTableSettings)

// Switch Handsontable theme when dark mode changes
watch(themeName, (name) => {
  nextTick(() => {
    const hot = hotRef.value?.hotInstance
    if (hot && !hot.isDestroyed) {
      hot.updateSettings({ themeName: name })
    }
  })
})

// Force Handsontable to reload when display data changes (e.g. transforms applied)
watch(tableData, (newData) => {
  nextTick(() => {
    const hot = hotRef.value?.hotInstance
    if (hot && !hot.isDestroyed) {
      syncing = true
      hot.loadData(newData)
      syncing = false
    }
  })
})

defineExpose({
  renameColumn,
})
</script>

<style scoped lang="scss">
.data-check-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem 1rem;
  color: var(--bs-secondary-color);
  border: 1px dashed var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  text-align: center;

  .data-check-empty-icon {
    font-size: 2rem;
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
  }
}

.data-check-table {
  overflow: auto;
  max-height: 500px;
  position: relative;
  z-index: 0;
}
</style>

<!-- Unscoped: --ht-* variables must be set on Handsontable's internal theme wrapper -->
<style lang="scss">
.data-check-table .ht-theme-main,
.data-check-table .ht-theme-main-dark {
  // Color system
  --ht-accent-color: var(--bs-primary);
  --ht-foreground-color: var(--bs-body-color);
  --ht-foreground-secondary-color: var(--bs-secondary-color);
  --ht-background-color: var(--bs-body-bg);
  --ht-border-color: var(--bs-border-color);
  --ht-read-only-color: var(--bs-body-color);

  // Typography
  --ht-font-size: 0.8125rem;
  --ht-line-height: 1.5;

  // Headers (column headers)
  --ht-header-font-weight: 600;
  --ht-header-foreground-color: var(--bs-secondary-text-emphasis);
  --ht-header-background-color: var(--bs-tertiary-bg);
  --ht-header-highlighted-foreground-color: var(--bs-secondary-text-emphasis);
  --ht-header-highlighted-background-color: var(--bs-secondary-bg);
  --ht-header-active-foreground-color: var(--bs-secondary-text-emphasis);
  --ht-header-active-background-color: var(--bs-secondary-bg);

  // Row headers (row number column)
  --ht-header-row-foreground-color: var(--bs-secondary-color);
  --ht-header-row-background-color: var(--bs-tertiary-bg);
  --ht-header-row-highlighted-foreground-color: var(--bs-secondary-color);
  --ht-header-row-highlighted-background-color: var(--bs-tertiary-bg);
  --ht-header-row-active-foreground-color: var(--bs-secondary-color);
  --ht-header-row-active-background-color: var(--bs-tertiary-bg);

  // Cell padding
  --ht-cell-horizontal-padding: 0.875rem;
  --ht-cell-vertical-padding: 0.4375rem;

  // Cell borders
  --ht-cell-horizontal-border-color: var(--bs-border-color-translucent);
  --ht-cell-vertical-border-color: transparent;

  // Row cell backgrounds (uniform — no striping)
  --ht-row-cell-odd-background-color: var(--bs-body-bg);
  --ht-row-cell-even-background-color: var(--bs-body-bg);
  --ht-row-header-odd-background-color: var(--bs-tertiary-bg);
  --ht-row-header-even-background-color: var(--bs-tertiary-bg);

  // Selection
  --ht-cell-selection-border-color: var(--bs-primary);
  --ht-cell-selection-background-color: var(--bs-primary-bg-subtle);

  // Cell editor
  --ht-cell-editor-foreground-color: var(--bs-body-color);
  --ht-cell-editor-background-color: var(--bs-body-bg);
  --ht-cell-editor-border-color: var(--bs-primary);

  // Read-only cells
  --ht-cell-read-only-background-color: var(--bs-body-bg);

  // Wrapper
  --ht-wrapper-border-width: 1px;
  --ht-wrapper-border-color: var(--bs-border-color);
  --ht-wrapper-border-radius: var(--bs-border-radius);

  // Scrollbar
  --ht-scrollbar-track-color: var(--bs-tertiary-bg);
  --ht-scrollbar-thumb-color: var(--bs-secondary-bg);

  // Non-variable overrides
  th {
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
  }

  .htNumeric {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
}
</style>
