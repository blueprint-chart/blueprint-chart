<template>
  <div
    class="canvas-mode-picker"
    @mouseenter="expanded = true"
    @mouseleave="expanded = false"
  >
    <template v-if="expanded">
      <CanvasModePickerOption
        v-for="opt in options"
        :key="opt.value"
        :mode="opt.value"
        :label="opt.label"
        :active="canvasMode === opt.value"
        @select="select(opt.value)"
      />
      <div class="canvas-mode-picker__divider" />
      <div class="canvas-mode-picker__extra">
        <CanvasDimensionsToggle />
        <span class="canvas-mode-picker__extra__label">Dims</span>
      </div>
    </template>
    <template v-else>
      <button
        class="canvas-mode-picker__trigger"
        title="Canvas mode"
      >
        <CanvasModePickerOptionSwatch :mode="canvasMode" />
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import { useEditorPanel } from '@/composables/useEditorPanel'
import type { CanvasMode } from '@/composables/useEditorPanel'
import CanvasModePickerOption from './CanvasModePickerOption.vue'
import CanvasModePickerOptionSwatch from './CanvasModePickerOptionSwatch.vue'
import CanvasDimensionsToggle from './CanvasDimensionsToggle.vue'

const { canvasMode, setCanvasMode } = useEditorPanel()

const expanded = shallowRef(false)

const options: { value: CanvasMode, label: string }[] = [
  { value: 'blueprint', label: 'Blueprint' },
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

function select(mode: CanvasMode) {
  setCanvasMode(mode)
  expanded.value = false
}
</script>

<style scoped lang="scss">
.canvas-mode-picker {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  z-index: 10;
  display: flex;
  align-items: stretch;
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  overflow: hidden;

  &__trigger {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 2px;
    border: none;
    background: none;
    cursor: pointer;
    color: var(--bs-body-color);
  }

  &__divider {
    width: 1px;
    align-self: stretch;
    margin: 0.375rem 0;
    background: var(--bs-border-color);
  }

  &__extra {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;

    &__label {
      font-size: var(--bs-font-size-xs);
      font-weight: 500;
      line-height: 1;
      white-space: nowrap;
      color: var(--bs-secondary-color);
    }
  }
}
</style>
