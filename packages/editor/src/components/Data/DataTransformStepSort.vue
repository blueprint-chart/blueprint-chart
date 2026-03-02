<template>
  <div class="data-transform-step-sort">
    <FormControlDropdown
      :model-value="step.config.column ?? ''"
      label="Sort by"
      :options="columnOptions"
      block
      @update:model-value="onUpdate('column', $event)"
    />
    <FormControlButtonGroup
      :model-value="step.config.direction ?? 'ascending'"
      label="Direction"
      :options="directionOptions"
      block
      @update:model-value="onUpdate('direction', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FormControlDropdown, FormControlButtonGroup } from '@blueprint-chart/ui'
import { useDataTransforms, type TransformStep } from '@/composables/useDataTransforms'

const props = defineProps<{
  step: TransformStep
  columns: string[]
}>()

const { updateStep } = useDataTransforms()

const columnOptions = computed(() =>
  props.columns.map(c => ({ value: c, label: c })),
)

const directionOptions = [
  { value: 'ascending', text: 'Ascending' },
  { value: 'descending', text: 'Descending' },
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
}
</style>
