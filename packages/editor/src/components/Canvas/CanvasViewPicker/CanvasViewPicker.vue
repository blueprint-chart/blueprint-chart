<template>
  <div
    class="canvas-view-picker"
    @mouseenter="expanded = true"
    @mouseleave="expanded = false"
  >
    <template v-if="expanded">
      <CanvasModeOption
        v-for="opt in options"
        :key="opt.value"
        :mode="opt.value"
        :label="opt.label"
        :active="canvasMode === opt.value"
        @select="select(opt.value)"
      />
      <div class="canvas-view-picker__divider" />
      <div class="canvas-view-picker__extra">
        <CanvasDimensionsToggle />
        <span class="canvas-view-picker__extra__label">Dims</span>
      </div>
    </template>
    <template v-else>
      <!-- Hover expands via the container's mouseenter; click/Enter covers
           touch and keyboard users, who never fire mouseenter. -->
      <button
        class="canvas-view-picker__trigger"
        title="Canvas mode"
        aria-label="Canvas mode"
        aria-haspopup="true"
        aria-expanded="false"
        @click="expanded = true"
      >
        <CanvasModeSwatch :mode="canvasMode" />
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useEditorPanel } from '@/stores/editorPanel'
import type { CanvasMode } from '@/stores/editorPanel'

const editorPanel = useEditorPanel()
const { canvasMode } = storeToRefs(editorPanel)
const { setCanvasMode } = editorPanel

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
.canvas-view-picker {
  position: absolute;
  // Host can lift the picker (e.g. above the floating scene-timeline) and align
  // its edge inset with that timeline via --canvas-float-inset. The host can
  // also flip it to the right edge (e.g. split view, where the left side is the
  // DSL editor) via --canvas-mode-picker-left/right.
  bottom: var(--canvas-mode-picker-bottom, 1rem);
  left: var(--canvas-mode-picker-left, var(--canvas-float-inset, 1rem));
  right: var(--canvas-mode-picker-right, auto);
  z-index: 10;
  display: flex;
  align-items: stretch;
  background: var(--bc-tile-bg);
  border: 1px solid var(--bc-hairline);
  border-radius: var(--bc-radius-sm);
  box-shadow: var(--bc-shadow-overlay);
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
