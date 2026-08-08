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
    <div class="chart-edit-toolbar__divider" />
    <CanvasViewPicker show-layout />
  </div>
</template>

<script setup lang="ts">
import { ButtonUndo, ButtonRedo } from '@blueprint-chart/ui'
import { useChartHistory } from '@/stores/chartHistory'

const { canUndo, canRedo, undo, redo } = useChartHistory()
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

  &__divider {
    width: 1px;
    align-self: stretch;
    margin: 0.25rem 0.125rem;
    background: var(--bs-border-color);
  }
}
</style>
