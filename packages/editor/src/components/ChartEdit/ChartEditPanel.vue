<template>
  <div class="chart-edit-panel">
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
      <LayoutBottomDrawer
        v-model="drawerOpen"
        :title="activeTab"
      >
        <ChartEditDockedPanel :collapsed="false" />
      </LayoutBottomDrawer>
    </template>
    <template v-else>
      <ChartEditDockedPanel :collapsed="panelMode !== 'docked'" />
    </template>
    <ChartEditIconRail />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type CSSProperties } from 'vue'
import { LayoutBottomDrawer, useBreakpoint } from '@blueprint-chart/ui'
import { useEditorPanel } from '@/composables/useEditorPanel'
import { useChartConfig } from '@/composables/useChartConfig'
import PreviewChart from '@/components/Preview/PreviewChart.vue'
import ChartEditDsl from './ChartEditDsl.vue'
import ChartEditDockedPanel from './ChartEditDockedPanel.vue'
import ChartEditIconRail from './ChartEditIconRail.vue'
import ChartEditFloatingPanel from './ChartEditFloatingPanel.vue'

const { panelMode, viewMode, activeTab } = useEditorPanel()
const { isNarrow } = useBreakpoint()
const drawerOpen = ref(true)
const { layout } = useChartConfig()
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
  } else if (l.heightMode === 'aspect-ratio') {
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
}

.chart-edit-panel__canvas {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.25rem 1.5rem;
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
    max-width: 100%;
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

// Override UI-library backgrounds so rail & panel match the mockup's white chrome
:deep(.navigation-icon-rail),
:deep(.layout-panel) {
  background: var(--bc-card-bg);
}
</style>
