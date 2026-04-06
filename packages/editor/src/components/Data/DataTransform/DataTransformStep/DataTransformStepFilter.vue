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
      :model-value="step.config.condition ?? FilterCondition.Equals"
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
import { FormControlDropdown, FormControlTextInput } from '@blueprint-chart/ui'
import { FilterCondition } from '@/enums'
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
  { value: FilterCondition.Equals, label: 'Equals' },
  { value: FilterCondition.NotEquals, label: 'Not equals' },
  { value: FilterCondition.Contains, label: 'Contains' },
  { value: FilterCondition.GreaterThan, label: 'Greater than' },
  { value: FilterCondition.LessThan, label: 'Less than' },
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
