<template>
  <div
    class="chart-edit-panel"
    :class="panelClassList"
  >
    <!-- Non-scrolling frame: the canvas scrolls inside it, but the mode picker
         is pinned to the frame so it stays put (like the floating timeline). -->
    <div
      class="chart-edit-panel__canvas-frame"
      :class="{
        'chart-edit-panel__canvas-frame--stacked': viewMode === 'split' && isNarrow,
      }"
    >
      <ChartEditToolbar class="chart-edit-panel__view-toolbar" />

      <ChartEditDsl
        v-if="dslVisible"
        class="chart-edit-panel__canvas__dsl"
        :style="dslPaneStyle"
      />
      <div
        v-if="viewMode === 'split' && !isNarrow"
        class="chart-edit-panel__divider"
        @pointerdown="onDividerDown"
      />

      <div
        v-if="chartVisible"
        ref="canvasRef"
        class="chart-edit-panel__canvas"
        :class="canvasClassList"
        :style="canvasStyle"
      >
        <div
          ref="cardRef"
          class="chart-edit-panel__canvas__card"
          :class="cardClass"
          :style="cardStyle"
        >
          <PreviewChart />
        </div>
        <CanvasDimensions
          v-if="showDimensions"
          :card-ref="cardRef"
          :canvas-ref="canvasRef"
          :layout="layout"
        />
        <FloatingSceneTimeline />
      </div>
      <CanvasModePicker v-if="chartVisible" />
    </div>
    <PanelShell
      v-model:drawer-open="drawerOpen"
      :title="panelTitle"
      :container-ref="canvasRef"
      @close="selectTab('')"
    >
      <template
        v-if="panelMode === 'drawer'"
        #tabs
      >
        <PanelTabBar
          :tabs="tabs"
          :model-value="activeTab"
          sticky
          @update:model-value="onDrawerTabPick"
        />
      </template>
      <EditorChartTypePicker v-if="activeTab === 'type'" />
      <EditorPropertyForm v-else-if="activeTab === 'text'" />
      <EditorAppearanceTab v-else-if="activeTab === 'style'" />
      <EditorSeriesPanel v-else-if="activeTab === 'series'" />
      <EditorAxisOptions v-else-if="activeTab === 'axes'" />
      <EditorLayoutTab v-else-if="activeTab === 'layout'" />
      <EditorAnnotateTab v-else-if="activeTab === 'annotate'" />
      <EditorInteractionsTab v-else-if="activeTab === 'interactions'" />
      <template
        v-if="panelMode !== 'drawer'"
        #footer
      >
        <PanelStepperFooter />
      </template>
    </PanelShell>
    <ChartEditIconRail v-if="!isNarrow" />
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { useBreakpoint } from '@blueprint-chart/ui'
import { useEditorPanel } from '@/stores/editorPanel'
import { usePanel, usePanelStore } from '@/stores/panel'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartEditSections } from '@/composables/useChartEditSections'
import FloatingSceneTimeline from '@/components/Scene/FloatingSceneTimeline.vue'
import { useScenes } from '@/composables/useScenes'

const editorPanel = useEditorPanel()
const { viewMode, activeTab, canvasMode, showDimensions, splitRatio } = storeToRefs(editorPanel)
const { stopPlayback } = useScenes()
const { selectTab, setLastNarrowEditTab } = editorPanel
const { mode: panelMode } = usePanel()
const panelStore = usePanelStore()
const { isNarrow } = useBreakpoint()

const { layout } = useChartConfig()
const { cardClass, cardStyle } = useCanvasCardStyle(layout, 'chart-edit-panel__canvas__card')
const { sections } = useChartEditSections()

const drawerOpen = computed({
  get: () => !!activeTab.value,
  set: (open) => {
    if (!open) {
      selectTab('')
    }
  },
})

// In narrow/drawer mode the panel renders as a bottom drawer with a
// full-viewport backdrop. activeTab defaults to 'type' (sensible for the
// docked desktop panel), so without this watch the drawer would auto-open
// on mount. Clear activeTab when entering drawer mode so the rail remains
// the explicit entry point.
watch(panelMode, (mode) => {
  if (mode === 'drawer' && activeTab.value) {
    setLastNarrowEditTab(activeTab.value)
    selectTab('')
  }
}, { immediate: true })

function onDrawerTabPick(tab: string) {
  setLastNarrowEditTab(tab)
  selectTab(tab)
}

// Scene playback runs in the scenes store, not the timeline component. The
// floating timeline (the only pause control in wide mode) is hidden in DSL
// view, so stop playback when the chart is fully hidden — otherwise it keeps
// advancing scenes with no way to pause.
watch(viewMode, (mode) => {
  if (mode === 'dsl') {
    stopPlayback()
  }
  // Narrow owns panel mode via the breakpoint sync; the dock/close dance is
  // wide-only (the icon rail that re-opens the panel exists only when
  // !isNarrow). On narrow, close() would strand the options panel as
  // unreachable, since the narrow open button only sets activeTab.
  if (isNarrow.value) {
    return
  }
  if (mode === 'preview') {
    panelStore.dock()
  }
  else {
    panelStore.close()
  }
})

const chartVisible = computed(() => viewMode.value !== 'dsl')
const dslVisible = computed(() => viewMode.value !== 'preview')

const dslPaneStyle = computed<CSSProperties>(() => {
  if (viewMode.value !== 'split' || isNarrow.value) {
    return { flex: '1 1 auto' }
  }
  return { flex: `0 0 ${splitRatio.value * 100}%` }
})

function onDividerDown(e: PointerEvent) {
  const frame = (e.currentTarget as HTMLElement).parentElement
  if (!frame) {
    return
  }
  const rect = frame.getBoundingClientRect()
  const target = e.currentTarget as HTMLElement
  target.setPointerCapture?.(e.pointerId)

  function onMove(ev: PointerEvent) {
    if (rect.width <= 0) {
      return
    }
    editorPanel.setSplitRatio((ev.clientX - rect.left) / rect.width)
  }
  function onUp() {
    target.releasePointerCapture?.(e.pointerId)
    target.removeEventListener('pointermove', onMove)
    target.removeEventListener('pointerup', onUp)
  }
  target.addEventListener('pointermove', onMove)
  target.addEventListener('pointerup', onUp)
}

const tabs = computed(() =>
  sections.value.map(s => ({ key: s.key, label: s.label, icon: s.icon })),
)
const panelClassList = computed(() => ({
  'chart-edit-panel--narrow': isNarrow.value,
}))

const canvasClassList = computed(() => ({
  [`chart-edit-panel__canvas--${canvasMode.value}`]: canvasMode.value !== 'blueprint',
  // Reserve extra bottom space so the canvas dimension ruler clears the
  // floating timeline when scrolled.
  'chart-edit-panel__canvas--dimensions': chartVisible.value && showDimensions.value,
}))

const TAB_LABELS: Record<string, string> = {
  type: 'Chart Type',
  text: 'Text',
  style: 'Style',
  layout: 'Layout',
  series: 'Series',
  axes: 'Axes',
  annotate: 'Annotate',
  interactions: 'Interactions',
}

const panelTitle = computed(() => TAB_LABELS[activeTab.value] ?? 'Panel')

const canvasRef = useTemplateRef<HTMLElement>('canvasRef')
const cardRef = useTemplateRef<HTMLElement>('cardRef')

const gridOffsetX = shallowRef(0)
const gridOffsetY = shallowRef(0)

function updateGridOffset() {
  const card = cardRef.value
  if (card) {
    gridOffsetX.value = card.offsetLeft
    gridOffsetY.value = card.offsetTop
  }
}

useResizeObserver(canvasRef, updateGridOffset)
useResizeObserver(cardRef, updateGridOffset)

const canvasStyle = computed<CSSProperties>(() => ({
  '--grid-offset-x': `${gridOffsetX.value}px`,
  '--grid-offset-y': `${gridOffsetY.value}px`,
} as CSSProperties))

</script>

<style scoped lang="scss">
.chart-edit-panel {
  display: flex;
  flex: 1;
  overflow: hidden;
  background: var(--bc-content-bg);

  &--narrow {
    flex-direction: column;
  }

  &__canvas-frame {
    position: relative; // positioning context for the pinned mode picker
    flex: 1;
    min-width: 0;
    display: flex;
    // Shared edge inset so the floating timeline and the canvas mode picker
    // sit the same distance from the canvas edge.
    --canvas-float-inset: 0.75rem;
    // Lift the canvas mode picker above the floating scene-timeline so they
    // don't overlap (the timeline floats across the canvas bottom).
    --canvas-mode-picker-bottom: 9rem;

    .chart-edit-panel--narrow & {
      // Narrow mode has no floating timeline (it uses the compact dock).
      --canvas-mode-picker-bottom: 1rem;
    }
  }

  &__view-toolbar {
    position: absolute;
    top: var(--canvas-float-inset);
    right: var(--canvas-float-inset);
    z-index: 4;
    background: var(--bc-chrome-bg);
    border: 1px solid var(--bc-hairline);
    border-radius: var(--bc-radius-sm);
    padding: 0.25rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }

  &__divider {
    flex: 0 0 6px;
    cursor: col-resize;
    background: var(--bc-hairline);
    align-self: stretch;
  }

  &__canvas {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    // Gap between the chart card and the floating timeline so scrolled content
    // keeps a margin above the timeline (the timeline is the only other
    // in-flow child; dimensions are absolutely positioned).
    gap: 2rem;
    // Padding is exposed as vars so the floating timeline can break out to a
    // uniform inset from the canvas edges (see FloatingSceneTimeline); the
    // padding derives from the vars so the two can never drift.
    --fst-canvas-pad-x: 3rem;
    --fst-canvas-pad-y: 2.5rem;
    padding: var(--fst-canvas-pad-y) var(--fst-canvas-pad-x);
    overflow: auto;
    // Disable rubber-band overscroll so the sticky timeline doesn't bounce
    // past the scroll limit (the pinned mode picker never moves; this keeps
    // the timeline consistent with it).
    overscroll-behavior: none;
    position: relative;
    // The blueprint grid is painted as the canvas background with
    // `background-attachment: local` so it tiles across the FULL scrollable
    // content (not just the visible viewport) and scrolls with it.
    background-color: var(--bc-canvas-bg);
    background-image:
      linear-gradient(var(--bc-canvas-grid-color-major) 1px, transparent 1px),
      linear-gradient(90deg, var(--bc-canvas-grid-color-major) 1px, transparent 1px),
      linear-gradient(var(--bc-canvas-grid-color) 1px, transparent 1px),
      linear-gradient(90deg, var(--bc-canvas-grid-color) 1px, transparent 1px);
    background-size:
      calc(var(--bc-canvas-grid-size) * 5) calc(var(--bc-canvas-grid-size) * 5),
      calc(var(--bc-canvas-grid-size) * 5) calc(var(--bc-canvas-grid-size) * 5),
      var(--bc-canvas-grid-size) var(--bc-canvas-grid-size),
      var(--bc-canvas-grid-size) var(--bc-canvas-grid-size);
    background-position: var(--grid-offset-x, 0) var(--grid-offset-y, 0);
    background-attachment: local;

    .chart-edit-panel--narrow & {
      --fst-canvas-pad-x: 1rem;
      --fst-canvas-pad-y: 1rem;
    }

    // When the dimension ruler is shown it extends ~60px below the card, so
    // reserve more space above the floating timeline for it to clear.
    &--dimensions {
      gap: 4.5rem;
    }

    &--light {
      background: #ffffff;
      --bc-canvas-dimension-color: rgba(0, 0, 0, 0.3);
    }

    // Auto resolves to the same surface as the explicit light/dark modes for
    // the current theme: --bc-chrome-bg is #ffffff (light) / #0f0f0f (dark) and
    // --bs-emphasis-color is #000 (light) / #fff (dark), so the canvas and its
    // dimension rulers are identical to Light in light theme and Dark in dark.
    &--auto {
      background: var(--bc-chrome-bg);
      --bc-canvas-dimension-color: color-mix(in srgb, var(--bs-emphasis-color) 30%, transparent);
    }

    &--dark {
      background: #0f0f0f;
      --bc-canvas-dimension-color: rgba(255, 255, 255, 0.3);
    }

    &__card {
      position: relative;
      z-index: 1;
      // Keep the card at its natural height so the CANVAS scrolls (with the
      // floating timeline pinned), rather than the card scrolling internally.
      // --fixed / --constrained-height override with `flex: none` as needed.
      flex-shrink: 0;
      background: var(--bc-tile-bg);
      border-radius: var(--bc-radius-sm);
      overflow: auto;

      &--fixed {
        flex: none;
        margin: 0 auto;
      }

      &--max-width {
        margin: 0 auto;
        width: 100%;
      }

      &--transparent {
        background: transparent;
      }

      &--constrained-height {
        flex: none;
        display: flex;
        flex-direction: column;

        :deep(.w-100.h-100) {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }
      }
    }

  }

  &__canvas-frame--stacked {
    flex-direction: column;

    .chart-edit-panel__canvas {
      flex: 0 0 45%;
      min-height: 0;
    }
    .chart-edit-panel__canvas__dsl {
      flex: 1 1 auto;
      min-height: 0;
      border-top: 1px solid var(--bc-hairline);
    }
  }

  &__canvas__dsl {
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: var(--bc-content-bg);
    overflow: hidden;
  }

  &__drawer-body {
    padding: 0.5rem 0;
  }
}

</style>
