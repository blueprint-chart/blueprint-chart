<template>
  <button
    class="canvas-mode-option"
    :class="{ 'canvas-mode-option--active': active }"
    :title="label"
    @click="$emit('select')"
  >
    <CanvasModeSwatch :mode="mode" />
    <span class="canvas-mode-option__label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import type { CanvasMode } from '@/stores/editorPanel'

defineProps<{
  mode: CanvasMode
  label: string
  active: boolean
}>()

defineEmits<{
  select: []
}>()
</script>

<style scoped lang="scss">
.canvas-mode-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--bs-secondary-color);
  transition: background-color 0.15s;

  &:hover {
    background: var(--bs-tertiary-bg);
  }

  &--active {
    color: var(--bs-body-color);

    :deep(.canvas-mode-swatch) {
      outline: 2px solid var(--bs-primary);
      outline-offset: 2px;
    }
  }

  &__label {
    font-size: var(--bs-font-size-xs);
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
  }
}
</style>
