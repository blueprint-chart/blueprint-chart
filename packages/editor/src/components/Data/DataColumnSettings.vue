<template>
  <div class="data-column-settings">
    <template v-if="selectedColumnIndex >= 0 && selectedColumnIndex < columns.length">
      <div class="data-column-settings__field">
        <div class="data-column-settings__field__label">
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
        <div class="data-column-settings__section__title">
          Detections
        </div>
        <div class="data-column-settings__section__detections">
          <span class="data-column-settings__section__detections__item data-column-settings__section__detections__item--success">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            ><path d="M20 6L9 17l-5-5" /></svg>
            {{ uniqueLabel }}
          </span>
          <span class="data-column-settings__section__detections__item data-column-settings__section__detections__item--info">
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
          <span
            v-if="benfordDetection"
            class="data-column-settings__section__detections__item"
            :class="benfordDetection.pass ? 'data-column-settings__section__detections__item--success' : 'data-column-settings__section__detections__item--warn'"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            ><path
              v-if="benfordDetection.pass"
              d="M20 6L9 17l-5-5"
            /><path
              v-else
              d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            /></svg>
            {{ benfordDetection.label }}
          </span>
        </div>
      </div>
    </template>
    <div
      v-else
      class="data-column-settings__picker"
    >
      <div class="data-column-settings__picker__label">
        Column
      </div>
      <FormControlDropdown
        model-value=""
        label=""
        :options="columnPickerOptions"
        block
        placeholder="Select a column…"
        @update:model-value="onPickColumn"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, computed, watch } from 'vue'
import { FormControlDropdown } from '@blueprint-chart/ui'
import { useEditorPanel } from '@/composables/useEditorPanel'
import { useDataTable } from '@/composables/useDataTable'
import { checkBenford } from '@/composables/useBenfordCheck'
import type { ColumnType } from '@/composables/useDataParser'
const { selectedColumnIndex, selectColumn } = useEditorPanel()
const { columns, rows, columnTypes, setColumnType } = useDataTable()

const columnType = shallowRef('string')

const typeOptions = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
]

watch(selectedColumnIndex, (idx) => {
  if (idx >= 0 && idx < columns.value.length) {
    columnType.value = columnTypes.value[idx] ?? 'string'
  }
}, { immediate: true })

function onTypeChange(type: string) {
  setColumnType(selectedColumnIndex.value, type as ColumnType)
}

const columnPickerOptions = computed(() =>
  columns.value.map((col, i) => ({ value: String(i), label: col })),
)

function onPickColumn(value: string) {
  selectColumn(parseInt(value, 10))
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

const benfordDetection = computed(() => {
  const idx = selectedColumnIndex.value
  if (idx < 0) {
    return null
  }
  const colName = columns.value[idx]
  const result = checkBenford([colName], rows.value.map(r => [r[idx]]), [columnTypes.value[idx]])
  if (!result.eligible) {
    return null
  }
  return {
    pass: result.pass,
    label: result.pass ? 'Follows Benford\'s law' : 'Doesn\'t follow Benford\'s law',
  }
})
</script>

<style scoped lang="scss">
.data-column-settings {
  display: flex;
  flex-direction: column;
  gap: 0;

  &__picker {
    padding-top: 0.25rem;

    &__label {
      font-size: var(--bs-font-size-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--bs-secondary-color);
      margin-bottom: 0.25rem;
    }
  }

  &__field {
    margin-bottom: 0.875rem;

    &__label {
      font-size: var(--bs-font-size-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--bs-secondary-color);
      margin-bottom: 0.25rem;
    }
  }

  &__divider {
    border: none;
    border-top: 1px solid var(--bs-border-color-translucent);
    margin: 1rem 0;
  }

  &__section {
    margin-bottom: 1.25rem;

    &__title {
      font-size: var(--bs-font-size-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--bs-secondary-color);
      margin-bottom: 0.5rem;
    }

    &__detections {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;

      &__item {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: var(--bs-font-size-xs);
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

        &--warn {
          background: var(--bs-warning-bg-subtle);
          color: var(--bs-warning-text-emphasis);
        }
      }
    }
  }
}
</style>
