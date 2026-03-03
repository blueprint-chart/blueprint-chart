<template>
  <button
    class="canvas-dimensions-toggle"
    :class="{ 'canvas-dimensions-toggle--active': showDimensions }"
    title="Show dimensions"
    @click="showDimensions = !showDimensions"
  >
    <IPhRuler />
  </button>
</template>

<script setup lang="ts">
import { useEditorPanel } from '@/composables/useEditorPanel'
import IPhRuler from '~icons/ph/ruler'

const { showDimensions } = useEditorPanel()
</script>

<style scoped lang="scss">
.canvas-dimensions-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.25rem;
  background: none;
  cursor: pointer;
  color: var(--bs-secondary-color);
  transition: background-color 0.15s, color 0.15s;

  &:hover {
    background: var(--bs-tertiary-bg);
  }

  &--active {
    color: var(--bs-primary);
    border-color: var(--bs-primary);
  }
}
</style>
