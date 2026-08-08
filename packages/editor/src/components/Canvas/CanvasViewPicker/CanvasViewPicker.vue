<template>
  <div
    ref="root"
    class="canvas-view-picker"
  >
    <button
      ref="triggerRef"
      type="button"
      class="canvas-view-picker__trigger"
      title="View options"
      aria-label="View options"
      aria-haspopup="true"
      :aria-expanded="open ? 'true' : 'false'"
      @click="open = !open"
    >
      <component
        :is="layoutIcon"
        v-if="layoutIcon"
        class="canvas-view-picker__trigger__icon"
      />
      <CanvasModeSwatch
        v-if="canvasVisible"
        :mode="canvasMode"
      />
      <IconPhCaretDown class="canvas-view-picker__caret" />
    </button>

    <div
      v-if="open"
      class="canvas-view-picker__panel"
    >
      <template v-if="showLayout">
        <div class="canvas-view-picker__label">
          Layout
        </div>
        <NavigationToggle
          v-model="viewModeModel"
          :options="viewModeOptions"
          size="sm"
        />
      </template>
      <div
        v-if="showLayout && canvasVisible"
        class="canvas-view-picker__divider"
      />
      <template v-if="canvasVisible">
        <div class="canvas-view-picker__label">
          Canvas
        </div>
        <div class="canvas-view-picker__modes">
          <CanvasModeOption
            v-for="opt in canvasOptions"
            :key="opt.value"
            :mode="opt.value"
            :label="opt.label"
            :active="canvasMode === opt.value"
            @select="selectCanvasMode(opt.value)"
          />
        </div>
        <div class="canvas-view-picker__dims">
          <CanvasDimensionsToggle />
          <span class="canvas-view-picker__dims__label">Dims</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { NavigationToggle, useBreakpoint } from '@blueprint-chart/ui'
import IconPhCaretDown from '~icons/ph/caret-down'
import IconViewChart from './IconViewChart.vue'
import IconViewSplit from './IconViewSplit.vue'
import IconViewDsl from './IconViewDsl.vue'
import { useEditorPanel } from '@/stores/editorPanel'
import type { CanvasMode, ViewMode } from '@/stores/editorPanel'

// The export step has no view modes, so the LAYOUT section is opt-in.
const props = withDefaults(defineProps<{
  showLayout?: boolean
}>(), {
  showLayout: false,
})

const editorPanel = useEditorPanel()
const { viewMode, canvasMode } = storeToRefs(editorPanel)
const { setViewMode, setCanvasMode } = editorPanel
const { isNarrow } = useBreakpoint()

const open = shallowRef(false)
const root = useTemplateRef<HTMLElement>('root')
const triggerRef = useTemplateRef<HTMLElement>('triggerRef')

// No `title`: the labels are visible in the popover, so a native tooltip would
// only repeat them.
const VIEW_MODES: { value: ViewMode, text: string, icon: Component }[] = [
  { value: 'preview', text: 'Chart', icon: IconViewChart },
  { value: 'split', text: 'Split', icon: IconViewSplit },
  { value: 'dsl', text: 'BPC', icon: IconViewDsl },
]

const canvasOptions: { value: CanvasMode, label: string }[] = [
  { value: 'blueprint', label: 'Blueprint' },
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

// Split is a wide-only mode: there is no room for a usable side-by-side or
// stacked split on narrow viewports, so the segment is filtered out. A wide
// window sitting in split that gets shrunk falls back to Chart via the watch in
// ChartEditPanel.
const viewModeOptions = computed(() =>
  VIEW_MODES.filter(m => !(isNarrow.value && m.value === 'split')),
)

const viewModeModel = computed({
  get: () => viewMode.value,
  set: (mode: string) => {
    setViewMode(mode as ViewMode)
    open.value = false
  },
})

const layoutIcon = computed(() =>
  props.showLayout ? VIEW_MODES.find(m => m.value === viewMode.value)?.icon : undefined,
)

// No canvas in BPC-only mode, so nothing to style: the CANVAS section and the
// trigger swatch both drop out.
const canvasVisible = computed(() => viewMode.value !== 'dsl')

function selectCanvasMode(mode: CanvasMode) {
  setCanvasMode(mode)
  open.value = false
}

// Window-level Escape handler: the panel is not focusable, so after opening by
// click (focus sits on the trigger) a keydown would never reach the panel.
onKeyStroke('Escape', (event) => {
  if (!open.value) {
    return
  }
  event.preventDefault()
  open.value = false
  triggerRef.value?.focus()
})

// Outside-click handler on mousedown (not click) so the panel closes before
// anything under the pointer activates.
useEventListener(document, 'mousedown', (event: MouseEvent) => {
  if (!open.value) {
    return
  }
  const target = event.target as HTMLElement | null
  if (target && root.value && !root.value.contains(target)) {
    open.value = false
  }
})
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
  align-items: center;
  background: var(--bc-tile-bg);
  border: 1px solid var(--bc-hairline);
  border-radius: var(--bc-radius-sm);
  box-shadow: var(--bc-shadow-overlay);

  &__trigger {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.375rem;
    border: none;
    border-radius: var(--bc-radius-xs);
    background: none;
    cursor: pointer;
    color: var(--bs-body-color);

    &:hover {
      background: var(--bs-tertiary-bg);
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--bc-focus-ring);
    }

    // The swatch is sized for the option grid (32px); in the trigger it sits
    // beside a text-sized caret, so scale it down to match.
    :deep(.canvas-mode-swatch) {
      width: 1rem;
      height: 1rem;
    }

    &__icon {
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
    }
  }

  &__caret {
    flex-shrink: 0;
    opacity: 0.55;
  }

  &__panel {
    position: absolute;
    top: calc(100% + 0.25rem);
    right: 0;
    z-index: 50;
    padding: 0.625rem;
    background: var(--bc-tile-bg);
    border: 1px solid var(--bc-hairline);
    border-radius: var(--bc-radius-sm);
    box-shadow: var(--bc-shadow-overlay);
  }

  &__label {
    margin-bottom: 0.4375rem;
    font-size: var(--bs-font-size-xs);
    font-weight: 500;
    letter-spacing: 0.09em;
    line-height: 1;
    text-transform: uppercase;
    color: var(--bs-secondary-color);
  }

  &__modes {
    display: flex;
    align-items: stretch;
    gap: 0.25rem;
  }

  &__dims {
    display: flex;
    align-items: center;
    gap: 0.4375rem;
    margin-top: 0.6875rem;

    &__label {
      font-size: var(--bs-font-size-xs);
      font-weight: 500;
      line-height: 1;
      white-space: nowrap;
      color: var(--bs-secondary-color);
    }
  }

  &__divider {
    height: 1px;
    // Full-bleed across the panel padding.
    margin: 0.6875rem -0.625rem;
    background: var(--bs-border-color);
  }

  // The segmented control collapses to icon-only below 576px (see
  // NavigationSegmentedControl). Inside the popover the width is ours and there
  // is room for the labels, and hiding them would bring back the "the icons do
  // not say what they do" problem this popover exists to fix.
  @media (max-width: 575.98px) {
    :deep(.navigation-segmented-control__option) {
      justify-content: flex-start;
      gap: var(--segmented-option-gap);
      padding: var(--segmented-option-padding-y) var(--segmented-option-padding-x);
    }

    :deep(.navigation-segmented-control__option__label) {
      display: initial;
    }
  }
}
</style>
