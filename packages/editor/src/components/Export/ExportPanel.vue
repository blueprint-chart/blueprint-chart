<template>
  <div
    class="export-panel"
    :class="{ 'export-panel--narrow': isNarrow }"
  >
    <ExportIconRail
      v-if="isNarrow"
      horizontal
    />
    <div
      ref="canvasRef"
      class="export-panel__canvas"
      :class="canvasClassList"
      :style="canvasStyle"
    >
      <div
        v-if="viewMode === 'preview'"
        ref="cardRef"
        class="export-panel__card"
        :class="cardClass"
        :style="cardStyle"
      >
        <div
          ref="previewRef"
          class="export-panel__preview"
        />
      </div>
      <CanvasDimensions
        v-if="viewMode === 'preview' && showDimensions"
        :card-ref="cardRef"
        :canvas-ref="canvasRef"
        :layout="layout"
      />
      <CanvasModePicker v-if="viewMode === 'preview'" />
      <ChartEditDsl
        v-else
        class="export-panel__dsl"
      />
      <ExportFloatingPanel
        v-if="!isNarrow && panelMode === 'floating'"
        :container-ref="canvasRef"
        @download-png="downloadPng"
        @download-svg="downloadSvg"
      />
    </div>
    <template v-if="isNarrow">
      <LayoutBottomDrawer v-model="drawerOpen">
        <PanelTabBar
          :tabs="tabs"
          :model-value="exportTab"
          sticky
          @update:model-value="setExportTab($event as ExportTab)"
        />
        <div class="export-panel__drawer-body">
          <ExportEmbedPanel v-if="exportTab === 'embed'" />
          <ExportDownloadPanel
            v-else
            @download-png="downloadPng"
            @download-svg="downloadSvg"
          />
        </div>
      </LayoutBottomDrawer>
    </template>
    <template v-else>
      <ExportDockedPanel
        :collapsed="panelMode !== 'docked'"
        @float="float"
        @close="collapse"
        @download-png="downloadPng"
        @download-svg="downloadSvg"
      />
      <ExportIconRail />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type CSSProperties } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { LayoutBottomDrawer, useBreakpoint } from '@blueprint-chart/ui'
import { useEditorPanel } from '@/composables/useEditorPanel'
import { useExportPanel, type ExportTab } from '@/composables/useExportPanel'
import { useChartConfig } from '@/composables/useChartConfig'
import { useChartPreview } from '@/composables/useChartPreview'
import { useImageExport } from '@/composables/useImageExport'
import PanelTabBar from '@/components/Panel/PanelTabBar.vue'
import ChartEditDsl from '@/components/ChartEdit/ChartEditDsl.vue'
import ExportIconRail from './ExportIconRail.vue'
import ExportDockedPanel from './ExportDockedPanel.vue'
import ExportFloatingPanel from './ExportFloatingPanel.vue'
import ExportEmbedPanel from './ExportEmbedPanel.vue'
import ExportDownloadPanel from './ExportDownloadPanel.vue'
import CanvasDimensions from '@/components/Canvas/CanvasDimensions.vue'
import CanvasModePicker from '@/components/Canvas/CanvasModePicker.vue'

const { viewMode, canvasMode, showDimensions, panelMode, float, collapse } = useEditorPanel()
const { exportTab, setExportTab } = useExportPanel()
const { isNarrow } = useBreakpoint()
const { layout } = useChartConfig()

const canvasRef = ref<HTMLElement | null>(null)
const cardRef = ref<HTMLElement | null>(null)
const previewRef = ref<HTMLElement | null>(null)
useChartPreview(previewRef)
const { downloadSvg, downloadPng } = useImageExport(previewRef, cardRef)

const gridOffsetX = ref(0)
const gridOffsetY = ref(0)

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

const drawerOpen = ref(true)

const tabs = [
  { key: 'embed', label: 'Embed' },
  { key: 'download', label: 'Download' },
]

const canvasClassList = computed(() => ({
  [`export-panel__canvas--${canvasMode.value}`]: canvasMode.value !== 'blueprint',
}))

function parseAspectRatio(ratio: string): number | undefined {
  const parts = ratio.split(':')
  if (parts.length !== 2) {
    return undefined
  }
  const w = Number(parts[0])
  const h = Number(parts[1])
  return w && h ? w / h : undefined
}

const hasConstrainedHeight = computed(() =>
  layout.value.heightMode === 'fixed' || layout.value.heightMode === 'aspect-ratio',
)

const cardClass = computed(() => ({
  'export-panel__card--fixed': layout.value.sizing === 'fixed',
  'export-panel__card--max-width': layout.value.sizing === 'max-width',
  'export-panel__card--transparent': layout.value.transparentBackground,
  'export-panel__card--constrained-height': hasConstrainedHeight.value,
}))

const cardStyle = computed<CSSProperties>(() => {
  const l = layout.value
  const style: CSSProperties = {
    padding: `${l.padding}px`,
  }
  if (l.sizing === 'fixed') {
    style.width = `${l.fixedWidth}px`
  }
  else if (l.sizing === 'max-width') {
    style.maxWidth = `${l.maxWidth}px`
    style.width = '100%'
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
.export-panel {
  display: flex;
  flex: 1;
  overflow: hidden;

  &--narrow {
    flex-direction: column;
  }
}

.export-panel__canvas {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2.5rem 3rem;
  overflow: auto;
  position: relative;
  background: var(--bc-canvas-bg);

  .export-panel--narrow & {
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
    mask-image: linear-gradient(to bottom, black, transparent);
    -webkit-mask-image: linear-gradient(to bottom, black, transparent);
  }

  &--auto,
  &--light,
  &--dark {
    &::before {
      display: none;
    }
  }

  &--light,
  &--auto {
    background: #f0f0f0;
    --bc-canvas-dimension-color: rgba(0, 0, 0, 0.3);
  }

  &--dark {
    background: #1a1a1a;
    --bc-canvas-dimension-color: rgba(255, 255, 255, 0.3);
  }

  :global([data-bs-theme="dark"]) &--auto {
    background: #1a1a1a;
    --bc-canvas-dimension-color: rgba(255, 255, 255, 0.3);
  }
}

.export-panel__card {
  position: relative;
  z-index: 1;
  background: var(--bs-card-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius-sm);
  overflow: auto;
  box-shadow: var(--bs-card-box-shadow);
  padding: 1.25rem 1.5rem;

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

.export-panel__preview {
  min-height: 200px;
}

.export-panel__dsl {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.export-panel__drawer-body {
  padding: 0.75rem;
}

:deep(.navigation-icon-rail),
:deep(.layout-panel) {
  background: var(--bs-body-bg);
}
</style>
