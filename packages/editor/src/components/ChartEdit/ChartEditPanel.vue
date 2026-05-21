<template>
  <div
    class="chart-edit-panel"
    :class="panelClassList"
  >
    <ChartEditIconRail
      v-if="isNarrow"
      horizontal
    />
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
          @update:model-value="selectTab"
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

const editorPanel = useEditorPanel()
const { viewMode, activeTab, canvasMode, showDimensions } = storeToRefs(editorPanel)
const { selectTab } = editorPanel
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
    selectTab('')
  }
}, { immediate: true })

const tabs = computed(() =>
  sections.value.map(s => ({ key: s.key, label: s.label, icon: s.icon })),
)
const panelClassList = computed(() => ({
  'chart-edit-panel--narrow': isNarrow.value,
}))

const canvasClassList = computed(() => ({
  [`chart-edit-panel__canvas--${canvasMode.value}`]: canvasMode.value !== 'blueprint',
  'chart-edit-panel__canvas--dsl': viewMode.value !== 'preview',
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

  &__canvas {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 2.5rem 3rem;
    overflow: auto;
    position: relative;
    background: var(--bc-canvas-bg);

    .chart-edit-panel--narrow & {
      padding: 1rem;
    }

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
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
    }

    // Plain canvas modes — hide grid, use flat background
    &--auto,
    &--light,
    &--dark {
      &::before {
        display: none;
      }
    }

    &--light,
    &--auto {
      background: #ffffff;
      --bc-canvas-dimension-color: rgba(0, 0, 0, 0.3);
    }

    &--dark {
      background: #151518;
      --bc-canvas-dimension-color: rgba(255, 255, 255, 0.3);
    }

    :global([data-bs-theme="dark"]) &--auto {
      background: #151518;
      --bc-canvas-dimension-color: rgba(255, 255, 255, 0.3);
    }

    // DSL editor mode — fill the full canvas
    &--dsl {
      padding: 0;

      &::before {
        display: none;
      }
    }

    &__card {
      position: relative;
      z-index: 1;
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
