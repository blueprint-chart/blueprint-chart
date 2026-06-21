<template>
  <div
    class="chart-edit-panel"
    :class="panelClassList"
  >
    <!-- Non-scrolling frame: the canvas scrolls inside it, but the mode picker
         is pinned to the frame so it stays put (like the floating timeline). -->
    <div class="chart-edit-panel__canvas-frame">
      <div
        ref="canvasRef"
        class="chart-edit-panel__canvas"
        :class="canvasClassList"
        :style="canvasStyle"
      >
        <div
          v-if="viewMode === 'preview'"
          ref="cardRef"
          class="chart-edit-panel__canvas__card"
          :class="cardClass"
          :style="cardStyle"
        >
          <PreviewChart />
        </div>
        <ChartEditDsl
          v-else
          class="chart-edit-panel__canvas__dsl"
        />
        <CanvasDimensions
          v-if="viewMode === 'preview' && showDimensions"
          :card-ref="cardRef"
          :canvas-ref="canvasRef"
          :layout="layout"
        />
        <FloatingSceneTimeline v-if="viewMode === 'preview'" />
      </div>
      <CanvasModePicker v-if="viewMode === 'preview'" />
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
      <template
        v-if="panelMode !== 'drawer'"
        #header
      >
        <ChartEditToolbar />
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
import { usePanel } from '@/stores/panel'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartEditSections } from '@/composables/useChartEditSections'
import FloatingSceneTimeline from '@/components/Scene/FloatingSceneTimeline.vue'
import { useScenes } from '@/composables/useScenes'

const editorPanel = useEditorPanel()
const { viewMode, activeTab, canvasMode, showDimensions } = storeToRefs(editorPanel)
const { stopPlayback } = useScenes()
const { selectTab, setLastNarrowEditTab } = editorPanel
const { mode: panelMode } = usePanel()
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
// view, so stop playback when leaving preview — otherwise it keeps advancing
// scenes with no way to pause.
watch(viewMode, (mode) => {
  if (mode !== 'preview') {
    stopPlayback()
  }
})

const tabs = computed(() =>
  sections.value.map(s => ({ key: s.key, label: s.label, icon: s.icon })),
)
const panelClassList = computed(() => ({
  'chart-edit-panel--narrow': isNarrow.value,
}))

const canvasClassList = computed(() => ({
  [`chart-edit-panel__canvas--${canvasMode.value}`]: canvasMode.value !== 'blueprint',
  'chart-edit-panel__canvas--dsl': viewMode.value !== 'preview',
  // Reserve extra bottom space so the canvas dimension ruler clears the
  // floating timeline when scrolled.
  'chart-edit-panel__canvas--dimensions': viewMode.value === 'preview' && showDimensions.value,
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

    // DSL editor mode — fill the full canvas, no grid
    &--dsl {
      --fst-canvas-pad-x: 0px;
      --fst-canvas-pad-y: 0px;
      // CodeMirror scrolls internally; the canvas itself must not scroll too,
      // or there'd be a double scrollbar. The scene timeline is hidden in DSL
      // mode, so only a small bottom breathing space is needed.
      --fst-clearance: 1rem;
      overflow: hidden;
      background-image: none;
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

    &__dsl {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  }

  &__drawer-body {
    padding: 0.5rem 0;
  }
}

</style>
