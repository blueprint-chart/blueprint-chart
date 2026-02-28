<template>
  <div
    class="chart-edit-panel"
    :class="{ 'chart-edit-panel--narrow': isNarrow }"
  >
    <ChartEditIconRail
      v-if="isNarrow"
      horizontal
    />
    <div
      ref="canvasRef"
      class="chart-edit-panel__canvas"
    >
      <div
        v-if="viewMode === 'preview'"
        class="chart-edit-panel__card"
        :class="cardClass"
        :style="cardStyle"
      >
        <PreviewChart />
      </div>
      <ChartEditDsl
        v-else
        class="chart-edit-panel__dsl"
      />
      <ChartEditFloatingPanel
        v-if="panelMode === 'floating'"
        :container-ref="canvasRef"
      />
    </div>
    <template v-if="isNarrow">
      <LayoutBottomDrawer v-model="drawerOpen">
        <div class="chart-edit-panel__drawer-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="chart-edit-panel__drawer-tab"
            :class="{ 'chart-edit-panel__drawer-tab--active': activeTab === tab.key }"
            @click="selectTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="chart-edit-panel__drawer-body">
          <EditorChartTypePicker v-if="activeTab === 'type'" />
          <EditorPropertyForm v-else-if="activeTab === 'text'" />
          <EditorAppearanceTab v-else-if="activeTab === 'appearance'" />
          <EditorLayoutTab v-else-if="activeTab === 'layout'" />
          <EditorSeriesPanel v-else-if="activeTab === 'series'" />
          <EditorAxisOptions v-else-if="activeTab === 'axes'" />
          <EditorAnnotateTab v-else-if="activeTab === 'annotate'" />
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
import { ref, computed, type CSSProperties } from 'vue'
import { LayoutBottomDrawer, useBreakpoint } from '@blueprint-chart/ui'
import { useEditorPanel } from '@/composables/useEditorPanel'
import { useChartConfig } from '@/composables/useChartConfig'
import { useChartTypeOptions } from '@/composables/useChartTypeOptions'
import PreviewChart from '@/components/Preview/PreviewChart.vue'
import ChartEditDsl from './ChartEditDsl.vue'
import ChartEditDockedPanel from './ChartEditDockedPanel.vue'
import ChartEditIconRail from './ChartEditIconRail.vue'
import ChartEditFloatingPanel from './ChartEditFloatingPanel.vue'
import EditorChartTypePicker from '@/components/Editor/EditorChartTypePicker.vue'
import EditorPropertyForm from '@/components/Editor/EditorPropertyForm.vue'
import EditorAppearanceTab from '@/components/Editor/EditorAppearanceTab.vue'
import EditorLayoutTab from '@/components/Editor/EditorLayoutTab.vue'
import EditorSeriesPanel from '@/components/Editor/EditorSeriesPanel.vue'
import EditorAxisOptions from '@/components/Editor/EditorAxisOptions.vue'
import EditorAnnotateTab from '@/components/Editor/EditorAnnotateTab.vue'

const AXIS_KEYS = ['showVerticalAxis', 'verticalAxisDirection', 'showVerticalTicks', 'verticalLabelPosition', 'verticalGridStyle', 'verticalNumberFormat', 'verticalScaleType', 'verticalRangeMin', 'verticalRangeMax', 'showHorizontalAxis', 'showHorizontalTicks', 'horizontalLabelPosition', 'horizontalGridStyle', 'horizontalNumberFormat', 'horizontalScaleType', 'horizontalRangeMin', 'horizontalRangeMax']

const { panelMode, viewMode, activeTab, collapse, selectTab } = useEditorPanel()
const { isNarrow } = useBreakpoint()
const { chartType, layout } = useChartConfig()
const { availableOptionKeys } = useChartTypeOptions()

const hasAxisOptions = computed(() => availableOptionKeys.value.some(k => AXIS_KEYS.includes(k)))

const drawerOpen = computed({
  get: () => isNarrow.value && panelMode.value !== 'collapsed' && !!activeTab.value,
  set: (open) => { if (!open) collapse() },
})

const tabs = computed(() => {
  const base: { key: string, label: string }[] = [
    { key: 'type', label: 'Type' },
    { key: 'text', label: 'Text' },
    { key: 'appearance', label: 'Appearance' },
    { key: 'layout', label: 'Layout' },
  ]
  if (['line-multi', 'bar-multi'].includes(chartType.value)) {
    base.push({ key: 'series', label: 'Series' })
  }
  if (hasAxisOptions.value) {
    base.push({ key: 'axes', label: 'Axes' })
  }
  base.push({ key: 'annotate', label: 'Annotate' })
  return base
})
const canvasRef = ref<HTMLElement | null>(null)

function parseAspectRatio(ratio: string): number | undefined {
  const parts = ratio.split(':')
  if (parts.length !== 2) return undefined
  const w = Number(parts[0])
  const h = Number(parts[1])
  return w && h ? w / h : undefined
}

const hasConstrainedHeight = computed(() =>
  layout.value.heightMode === 'fixed' || layout.value.heightMode === 'aspect-ratio',
)

const cardClass = computed(() => ({
  'chart-edit-panel__card--fixed': layout.value.sizing === 'fixed',
  'chart-edit-panel__card--transparent': layout.value.transparentBackground,
  'chart-edit-panel__card--constrained-height': hasConstrainedHeight.value,
}))

const cardStyle = computed<CSSProperties>(() => {
  const l = layout.value
  const style: CSSProperties = {
    padding: `${l.padding}px`,
  }
  if (l.sizing === 'fixed') {
    style.width = `${l.fixedWidth}px`
  }
  if (l.heightMode === 'fixed') {
    style.height = `${l.fixedHeight}px`
  }
  else if (l.heightMode === 'aspect-ratio') {
    const ratio = parseAspectRatio(l.aspectRatio)
    if (ratio) {
      style.aspectRatio = String(ratio)
    }
  }
  return style
})
</script>

<style scoped lang="scss">
.chart-edit-panel {
  display: flex;
  flex: 1;
  overflow: hidden;

  &--narrow {
    flex-direction: column;
  }
}

.chart-edit-panel__canvas {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.25rem 1.5rem;

  .chart-edit-panel--narrow & {
    padding: 0.5rem;
  }
  overflow: auto;
  position: relative;
  background-color: var(--bc-canvas-bg);
  background-image:
    linear-gradient(var(--bc-canvas-grid-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--bc-canvas-grid-color) 1px, transparent 1px);
  background-size: var(--bc-canvas-grid-size) var(--bc-canvas-grid-size);
}

.chart-edit-panel__card {
  background: var(--bc-card-bg);
  border: 1px solid var(--bc-card-border);
  border-radius: var(--bs-border-radius-sm);
  overflow: auto;
  box-shadow: var(--bc-card-shadow);
  padding: 1.25rem 1.5rem;

  &--fixed {
    flex: none;
    margin: 0 auto;
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

    :deep(.bc-frame) {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    :deep(.bc-frame-body) {
      flex: 1;
      min-height: 0;
    }

    :deep(.bc-frame-body svg) {
      width: 100%;
      height: 100%;
      display: block;
    }
  }
}

.chart-edit-panel__dsl {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chart-edit-panel__drawer-tabs {
  display: flex;
  gap: 0;
  padding: 0 0.875rem;
  border-bottom: 1px solid var(--bs-border-color-translucent);
  overflow-x: auto;
  scrollbar-width: none;
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--bs-body-bg);

  &::-webkit-scrollbar {
    display: none;
  }
}

.chart-edit-panel__drawer-tab {
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  white-space: nowrap;
  flex-shrink: 0;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--bs-secondary-color);
  border-bottom: 2px solid transparent;
  transition: all 0.15s;

  &:hover {
    color: var(--bs-body-color);
  }

  &--active {
    color: var(--bs-primary);
    border-bottom-color: var(--bs-primary);
  }
}

.chart-edit-panel__drawer-body {
  padding: 0.5rem 0;
}

// Override UI-library backgrounds so rail & panel match the mockup's white chrome
:deep(.navigation-icon-rail),
:deep(.layout-panel) {
  background: var(--bc-card-bg);
}
</style>
