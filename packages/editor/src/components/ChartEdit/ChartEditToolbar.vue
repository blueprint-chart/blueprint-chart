<template>
  <div class="chart-edit-toolbar">
    <ButtonUndo
      :disabled="!canUndo"
      @click="undo"
    />
    <ButtonRedo
      :disabled="!canRedo"
      @click="redo"
    />
    <NavigationToggle
      v-model="viewModeModel"
      :options="viewModeOptions"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ButtonUndo, ButtonRedo, NavigationToggle } from '@blueprint-chart/ui'
import { useEditorPanel } from '@/composables/useEditorPanel'
import { useChartHistory } from '@/composables/useChartHistory'

const { viewMode, setViewMode } = useEditorPanel()
const { canUndo, canRedo, undo, redo } = useChartHistory()

const viewModeModel = computed({
  get: () => viewMode.value,
  set: (v: string) => setViewMode(v as 'preview' | 'dsl'),
})

const viewModeOptions = [
  { value: 'preview', text: 'Preview' },
  { value: 'dsl', text: 'DSL' },
]
</script>

<style scoped lang="scss">
.chart-edit-toolbar {
  display: flex;
  align-items: center;
  gap: 0.25rem;

  :deep(.btn-outline-secondary) {
    border-color: transparent;
    background: transparent;

    &:hover:not(:disabled) {
      background: var(--bs-tertiary-bg);
    }
  }

  .navigation-toggle {
    margin-left: auto;
  }
}
</style>
