<template>
  <div class="data-transform-step-filter">
    <FormControlDropdown
      :model-value="step.config.column ?? ''"
      label="Column"
      placeholder="Select a column"
      :options="columnOptions"
      block
      @update:model-value="onUpdate('column', $event)"
    />
    <FormControlDropdown
      :model-value="step.config.condition ?? 'equals'"
      label="Condition"
      :options="conditionOptions"
      block
      @update:model-value="onUpdate('condition', $event)"
    />
    <FormControlTextInput
      id="filter-value"
      :model-value="step.config.value ?? ''"
      label="Value"
      placeholder="Filter value"
      @update:model-value="onUpdate('value', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FormControlDropdown, FormControlTextInput } from '@blueprint-chart/ui'
import { useDataTransforms, type TransformStep } from '@/stores/dataTransforms'

const props = defineProps<{
  step: TransformStep
  columns: string[]
}>()

const { updateStep } = useDataTransforms()

const columnOptions = computed(() =>
  props.columns.map(c => ({ value: c, label: c })),
)

const conditionOptions = [
  { value: 'equals', label: 'Equals' },
  { value: 'not-equals', label: 'Not equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater-than', label: 'Greater than' },
  { value: 'less-than', label: 'Less than' },
]

function onUpdate(key: string, value: string) {
  updateStep(props.step.id, { ...props.step.config, [key]: value })
}
</script>

<style scoped lang="scss">
.data-transform-step-filter {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
