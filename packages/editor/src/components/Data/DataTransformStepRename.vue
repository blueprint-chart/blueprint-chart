<template>
  <div class="data-transform-step-rename">
    <FormControlDropdown
      :model-value="step.config.column ?? ''"
      label="Column"
      placeholder="Select a column"
      :options="columnOptions"
      block
      @update:model-value="onUpdate('column', $event)"
    />
    <FormControlTextInput
      id="rename-new-name"
      :model-value="step.config.newName ?? ''"
      label="New Name"
      placeholder="Enter new column name"
      @update:model-value="onUpdate('newName', $event)"
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

function onUpdate(key: string, value: string) {
  updateStep(props.step.id, { ...props.step.config, [key]: value })
}
</script>

<style scoped lang="scss">
.data-transform-step-rename {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
