<template>
  <div class="data-transform-step-sort">
    <div class="data-transform-step-sort__field">
      <label class="data-transform-step-sort__field__label">Sort by</label>
      <div class="data-transform-step-sort__field__columns">
        <label
          v-for="col in columns"
          :key="col"
          class="data-transform-step-sort__field__columns__column"
        >
          <input
            type="checkbox"
            :checked="selectedColumns.includes(col)"
            @change="toggleColumn(col)"
          >
          {{ col }}
        </label>
      </div>
    </div>
    <FormControlButtonGroup
      v-if="selectedColumns.length > 1 && allSelectedNumeric"
      :model-value="step.config.operation ?? ''"
      label="Operation"
      :options="operationOptions"
      block
      @update:model-value="onUpdate('operation', $event)"
    />
    <FormControlButtonGroup
      :model-value="step.config.direction ?? SortDirection.Ascending"
      label="Direction"
      :options="directionOptions"
      block
      @update:model-value="onUpdate('direction', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { FormControlButtonGroup } from '@blueprint-chart/ui'
import { SortDirection } from '@blueprint-chart/lib'
import { useDataTransforms, type TransformStep } from '@/stores/dataTransforms'
import type { ColumnType } from '@/composables/useDataParser'

const props = defineProps<{
  step: TransformStep
  columns: string[]
  columnTypes: ColumnType[]
}>()

const { updateStep } = useDataTransforms()

const selectedColumns = computed(() => {
  if (props.step.config.columns) {
    return props.step.config.columns.split(',').map(c => c.trim()).filter(Boolean)
  }
  if (props.step.config.column) {
    return [props.step.config.column]
  }
  return []
})

const allSelectedNumeric = computed(() => {
  return selectedColumns.value.every((col) => {
    const idx = props.columns.indexOf(col)
    return idx >= 0 && props.columnTypes[idx] === 'number'
  })
})

function toggleColumn(col: string) {
  const current = [...selectedColumns.value]
  const idx = current.indexOf(col)
  if (idx >= 0) {
    current.splice(idx, 1)
  }
  else {
    current.push(col)
  }
  const newConfig = { ...props.step.config }
  delete newConfig.column
  if (current.length === 0) {
    delete newConfig.columns
  }
  else {
    newConfig.columns = current.join(',')
  }
  // Clear operation when down to single column or not all numeric
  const allNumeric = current.every((c) => {
    const idx = props.columns.indexOf(c)
    return idx >= 0 && props.columnTypes[idx] === 'number'
  })
  if (current.length <= 1 || !allNumeric) {
    delete newConfig.operation
  }
  updateStep(props.step.id, newConfig)
}

const operationOptions = [
  { value: '', text: 'None' },
  { value: 'sum', text: 'Sum' },
  { value: 'avg', text: 'Avg' },
]

const directionOptions = [
  { value: SortDirection.Ascending, text: 'Ascending' },
  { value: SortDirection.Descending, text: 'Descending' },
]

function onUpdate(key: string, value: string) {
  updateStep(props.step.id, { ...props.step.config, [key]: value })
}
</script>

<style scoped lang="scss">
.data-transform-step-sort {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    &__label {
      font-size: var(--bs-font-size-xs);
      font-weight: 600;
      color: var(--bs-secondary-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    &__columns {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;

      &__column {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: var(--bs-font-size-sm);
        color: var(--bs-body-color);
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        border: 1px solid var(--bs-border-color);
        border-radius: var(--bs-border-radius);
        background: var(--bs-body-bg);
        transition: all 0.15s;

        &:hover {
          border-color: var(--bs-primary);
        }

        &:has(input:checked) {
          border-color: var(--bs-primary);
          background: var(--bs-primary-bg-subtle);
          color: var(--bs-primary);
        }

        input {
          accent-color: var(--bs-primary);
        }
      }
    }
  }
}
</style>
