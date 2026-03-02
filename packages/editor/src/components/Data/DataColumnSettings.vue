<template>
  <div class="data-column-settings">
    <template v-if="selectedColumnIndex >= 0 && selectedColumnIndex < columns.length">
      <div class="data-column-settings__field">
        <div class="data-column-settings__label">
          Column Name
        </div>
        <input
          v-model="columnName"
          class="data-column-settings__rename"
          @input="onRename(columnName)"
        >
      </div>

      <div class="data-column-settings__field">
        <div class="data-column-settings__label">
          Type
        </div>
        <FormControlDropdown
          v-model="columnType"
          label=""
          :options="typeOptions"
          block
          @update:model-value="onTypeChange"
        />
      </div>

      <hr class="data-column-settings__divider">

      <div class="data-column-settings__section">
        <div class="data-column-settings__section-title">
          Detections
        </div>
        <div class="data-column-settings__detections">
          <span class="data-column-settings__detection data-column-settings__detection--success">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            ><path d="M20 6L9 17l-5-5" /></svg>
            {{ uniqueLabel }}
          </span>
          <span class="data-column-settings__detection data-column-settings__detection--info">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            ><circle
              cx="12"
              cy="12"
              r="10"
            /><path d="M12 16v-4M12 8h.01" /></svg>
            {{ typeDetection }}
          </span>
        </div>
      </div>
    </template>
    <div
      v-else
      class="text-muted text-center py-4"
    >
      Select a column to view settings
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { FormControlDropdown } from '@blueprint-chart/ui'
import { useEditorPanel } from '@/composables/useEditorPanel'
import { useDataTable } from '@/composables/useDataTable'
import type { ColumnType } from '@/composables/useDataParser'
const { selectedColumnIndex } = useEditorPanel()
const { columns, rows, columnTypes, renameColumn, setColumnType } = useDataTable()

const columnName = ref('')
const columnType = ref('string')

const typeOptions = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
]

watch(selectedColumnIndex, (idx) => {
  if (idx >= 0 && idx < columns.value.length) {
    columnName.value = columns.value[idx]
    columnType.value = columnTypes.value[idx] ?? 'string'
  }
}, { immediate: true })

function onRename(name: string) {
  renameColumn(selectedColumnIndex.value, name)
}

function onTypeChange(type: string) {
  setColumnType(selectedColumnIndex.value, type as ColumnType)
}

const uniqueCount = computed(() => {
  const idx = selectedColumnIndex.value
  if (idx < 0) {
    return { unique: 0, total: 0 }
  }
  const vals = rows.value.map(r => r[idx] ?? '').filter(v => v.length > 0)
  const unique = new Set(vals).size
  return { unique, total: vals.length }
})

const uniqueLabel = computed(() => {
  const { unique, total } = uniqueCount.value
  if (unique === total) {
    return `${unique} unique values — no duplicates`
  }
  return `${total - unique} duplicates found`
})

const typeDetection = computed(() => {
  const type = columnTypes.value[selectedColumnIndex.value]
  if (type === 'number') {
    return 'Numeric measure detected'
  }
  if (type === 'date') {
    return 'Date axis detected'
  }
  return 'Categorical dimension detected'
})
</script>

<style scoped lang="scss">
.data-column-settings {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.data-column-settings__field {
  margin-bottom: 0.875rem;
}

.data-column-settings__label {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--bs-secondary-color);
  margin-bottom: 0.25rem;
}

.data-column-settings__rename {
  font-size: 1rem;
  font-weight: 700;
  border: none;
  border-bottom: 2px solid transparent;
  outline: none;
  background: transparent;
  padding: 0.125rem 0;
  color: var(--bs-body-color);
  font-family: inherit;
  width: 100%;

  &:focus {
    border-bottom-color: var(--bs-primary);
  }
}

.data-column-settings__divider {
  border: none;
  border-top: 1px solid var(--bs-border-color-translucent);
  margin: 1rem 0;
}

.data-column-settings__section {
  margin-bottom: 1.25rem;
}

.data-column-settings__section-title {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--bs-secondary-color);
  margin-bottom: 0.5rem;
}

.data-column-settings__detections {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.data-column-settings__detection {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1875rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;

  svg {
    width: 0.75rem;
    height: 0.75rem;
    flex-shrink: 0;
  }

  &--success {
    background: var(--bs-success-bg-subtle);
    color: var(--bs-success-text-emphasis);
  }

  &--info {
    background: var(--bs-primary-bg-subtle);
    color: var(--bs-primary-text-emphasis);
  }
}
</style>
