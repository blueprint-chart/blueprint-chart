<template>
  <div class="data-transform-step-hide-columns">
    <div class="data-transform-step-hide-columns__field">
      <label class="data-transform-step-hide-columns__label">Hide columns</label>
      <div class="data-transform-step-hide-columns__columns">
        <label
          v-for="col in columns"
          :key="col"
          class="data-transform-step-hide-columns__column"
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDataTransforms, type TransformStep } from '@/composables/useDataTransforms'

const props = defineProps<{
  step: TransformStep
  columns: string[]
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
  updateStep(props.step.id, newConfig)
}
</script>

<style scoped lang="scss">
.data-transform-step-hide-columns {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.data-transform-step-hide-columns__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.data-transform-step-hide-columns__label {
  font-size: var(--bs-font-size-xs);
  font-weight: 600;
  color: var(--bs-secondary-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-transform-step-hide-columns__columns {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.data-transform-step-hide-columns__column {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--bs-font-size-sm);
  color: var(--bs-body-color);
  cursor: pointer;
  padding: 0.1875rem 0.5rem;
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
</style>
