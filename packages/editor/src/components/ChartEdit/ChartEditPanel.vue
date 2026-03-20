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
      <ChartEditFloatingPanel
        v-if="panelMode === 'floating'"
        :container-ref="canvasRef"
      />
    </div>
    <template v-if="isNarrow">
      <LayoutBottomDrawer v-model="drawerOpen">
        <PanelTabBar
          :tabs="tabs"
          :model-value="activeTab"
          sticky
          @update:model-value="selectTab"
        />
        <div class="chart-edit-panel__drawer-body">
          <EditorChartTypePicker v-if="activeTab === 'type'" />
          <EditorPropertyForm v-else-if="activeTab === 'text'" />
          <EditorAppearanceTab v-else-if="activeTab === 'style'" />
          <EditorSeriesPanel v-else-if="activeTab === 'series'" />
          <EditorAxisOptions v-else-if="activeTab === 'axes'" />
          <EditorLayoutTab v-else-if="activeTab === 'layout'" />
          <EditorAnnotateTab v-else-if="activeTab === 'annotate'" />
          <EditorInteractionsTab v-else-if="activeTab === 'interactions'" />
        </div>
      </LayoutBottomDrawer>
    </template>
    <template v-else>
      <ChartEditDockedPanel :collapsed="panelMode !== 'docked'" />
      <ChartEditIconRail />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, watch, type CSSProperties } from 'vue'
import { storeToRefs } from 'pinia'
import { useResizeObserver } from '@vueuse/core'
import { LayoutBottomDrawer, useBreakpoint } from '@blueprint-chart/ui'
import { useEditorPanel } from '@/stores/editorPanel'
import { useCanvasCardStyle } from '@/composables/useCanvasCardStyle'
import PanelTabBar from '@/components/Panel/PanelTabBar.vue'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import { useScenes } from '@/stores/scenes'
import PreviewChart from '@/components/Preview/PreviewChart.vue'
import ChartEditDsl from './ChartEditDsl.vue'
import ChartEditDockedPanel from './ChartEditDockedPanel.vue'
import ChartEditIconRail from './ChartEditIconRail.vue'
import ChartEditFloatingPanel from './ChartEditFloatingPanel.vue'
import CanvasDimensions from '@/components/Canvas/CanvasDimensions.vue'
import CanvasModePicker from '@/components/Canvas/CanvasModePicker.vue'
import EditorChartTypePicker from '@/components/Editor/EditorChartTypePicker.vue'
import EditorPropertyForm from '@/components/Editor/EditorPropertyForm.vue'
import EditorAppearanceTab from '@/components/Editor/EditorAppearanceTab.vue'
import EditorLayoutTab from '@/components/Editor/EditorLayoutTab.vue'
import EditorSeriesPanel from '@/components/Editor/EditorSeriesPanel.vue'
import EditorAxisOptions from '@/components/Editor/EditorAxisOptions.vue'
import EditorAnnotateTab from '@/components/Editor/EditorAnnotateTab.vue'
import EditorInteractionsTab from '@/components/Editor/EditorInteractionsTab.vue'

const AXIS_KEYS = ['showVerticalAxis', 'verticalAxisDirection', 'showVerticalTicks', 'verticalLabelPosition', 'verticalGridStyle', 'verticalNumberFormat', 'verticalScaleType', 'verticalRangeMin', 'verticalRangeMax', 'showHorizontalAxis', 'showHorizontalTicks', 'horizontalLabelPosition', 'horizontalGridStyle', 'horizontalNumberFormat', 'horizontalScaleType', 'horizontalRangeMin', 'horizontalRangeMax']

const editorPanel = useEditorPanel()
const { panelMode, viewMode, activeTab, canvasMode, showDimensions } = storeToRefs(editorPanel)
const { collapse, selectTab } = editorPanel
const { isNarrow } = useBreakpoint()

watch(isNarrow, (narrow) => {
  if (narrow && panelMode.value !== 'collapsed') {
    collapse()
  }
}, { immediate: true })
const { chartType, layout } = useChartConfig()
const { availableOptionKeys } = useChartTypeOptions()
const { scenes } = useScenes()
const { cardClass, cardStyle } = useCanvasCardStyle(layout, 'chart-edit-panel__canvas__card')

const hasAxisOptions = computed(() => availableOptionKeys.value.some(k => AXIS_KEYS.includes(k)))

const drawerOpen = computed({
  get: () => isNarrow.value && panelMode.value !== 'collapsed' && !!activeTab.value,
  set: (open) => {
    if (!open) {
      collapse()
    }
  },
})

const hasInteraction = computed(() =>
  availableOptionKeys.value.includes('tooltips')
  || availableOptionKeys.value.includes('crosshair')
  || scenes.value.length >= 1,
)

const tabs = computed(() => {
  const base: { key: string, label: string }[] = [
    { key: 'type', label: 'Type' },
    { key: 'text', label: 'Text' },
    { key: 'style', label: 'Style' },
  ]
  if (['line-multi', 'bar-multi'].includes(chartType.value)) {
    base.push({ key: 'series', label: 'Series' })
  }
  if (hasAxisOptions.value) {
    base.push({ key: 'axes', label: 'Axes' })
  }
  base.push({ key: 'layout', label: 'Layout' })
  base.push({ key: 'annotate', label: 'Annotate' })
  if (hasInteraction.value) {
    base.push({ key: 'interactions', label: 'Interactions' })
  }
  return base
})
const panelClassList = computed(() => ({
  'chart-edit-panel--narrow': isNarrow.value,
}))

const canvasClassList = computed(() => ({
  [`chart-edit-panel__canvas--${canvasMode.value}`]: canvasMode.value !== 'blueprint',
  'chart-edit-panel__canvas--dsl': viewMode.value !== 'preview',
}))

const canvasRef = ref<HTMLElement | null>(null)
const cardRef = ref<HTMLElement | null>(null)

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
  gap: var(--bc-tile-gap);
  background: var(--bc-void-bg);

  &--narrow {
    flex-direction: column;
    padding: 0;
    gap: 0;
  }

  &__canvas {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 2.5rem 3rem;
    overflow: auto;
    position: relative;
    background: var(--bc-canvas-bg);
    border-radius: var(--bc-tile-radius);
    box-shadow: var(--bc-tile-shadow);
    border: var(--bc-tile-border);

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
      background: var(--bs-card-bg);
      border: 1px solid var(--bs-border-color);
      border-radius: var(--bs-border-radius-sm);
      overflow: auto;
      box-shadow: var(--bs-card-box-shadow);

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

// Override UI-library background so panel matches the tile surface
:deep(.layout-panel) {
  background: var(--bc-tile-bg);
}
</style>
