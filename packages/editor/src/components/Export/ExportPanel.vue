<template>
  <div
    class="export-panel"
    :class="{ 'export-panel--narrow': isNarrow }"
  >
    <div
      ref="canvasRef"
      class="export-panel__canvas"
      :class="canvasClassList"
    >
      <ExportArticle :bare="previewContext === 'card'">
        <div
          ref="cardRef"
          class="export-panel__canvas__card"
          :class="cardClass"
          :style="cardStyle"
        >
          <div
            ref="previewRef"
            class="export-panel__canvas__preview w-100 h-100"
          />
        </div>
      </ExportArticle>
      <CanvasDimensions
        v-if="showDimensions"
        :key="previewContext"
        :card-ref="cardRef"
        :canvas-ref="canvasRef"
        :layout="layout"
      />
      <div class="export-panel__view-toolbar">
        <CanvasViewPicker extra-label="Preview">
          <template #default="{ close }">
            <NavigationToggle
              v-model="previewContextModel"
              :options="PREVIEW_OPTIONS"
              size="sm"
              @update:model-value="close"
            />
          </template>
        </CanvasViewPicker>
      </div>
    </div>
    <PanelShell
      v-model:drawer-open="drawerOpen"
      :title="panelTitle"
      :container-ref="canvasRef"
    >
      <template
        v-if="panelMode === 'drawer'"
        #tabs
      >
        <PanelTabBar
          :tabs="tabs"
          :model-value="exportTab"
          sticky
          @update:model-value="onDrawerTabPick"
        />
      </template>
      <ExportEmbedPanel v-if="exportTab === 'embed'" />
      <ExportDownloadPanel
        v-else-if="exportTab === 'download'"
        :error="downloadError"
        @download-png="downloadPng"
        @download-svg="downloadSvg"
      />
      <template
        v-if="panelMode !== 'drawer'"
        #footer
      >
        <PanelStepperFooter />
      </template>
    </PanelShell>
    <ExportIconRail v-if="!isNarrow" />
  </div>
</template>

<script setup lang="ts">
import { useBreakpoint, NavigationToggle } from '@blueprint-chart/ui'
import { useEditorPanel } from '@/stores/editorPanel'
import { usePanel } from '@/stores/panel'
import { useExportPanel, type ExportTab, type PreviewContext } from '@/stores/exportPanel'
import { useChartConfig } from '@/stores/chartConfig'
import { useExportSections } from '@/composables/useExportSections'

const editorPanel = useEditorPanel()
const { resolvedCanvasMode, showDimensions } = editorPanel
const { setViewMode } = editorPanel
const { mode: panelMode } = usePanel()

// Export step always shows preview (no DSL toggle)
setViewMode('preview')
const exportPanelStore = useExportPanel()
const { exportTab } = exportPanelStore
const { setExportTab: setExportTabAction, setLastNarrowExportTab } = exportPanelStore
const { isNarrow } = useBreakpoint()
const { previewContext, setPreviewContext } = exportPanelStore

const PREVIEW_OPTIONS = [
  { value: 'card', text: 'Card' },
  { value: 'article', text: 'Article' },
]

const previewContextModel = computed({
  get: () => previewContext.value,
  set: value => setPreviewContext(value as PreviewContext),
})

watch(panelMode, (mode) => {
  if (mode === 'drawer' && exportTab.value) {
    setLastNarrowExportTab(exportTab.value as Exclude<ExportTab, ''>)
    setExportTabAction('' as ExportTab)
  }
}, { immediate: true })

const { layout } = useChartConfig()
const { cardClass, cardStyle } = useCanvasCardStyle(layout, 'export-panel__canvas__card')

const canvasRef = useTemplateRef<HTMLElement>('canvasRef')
const cardRef = useTemplateRef<HTMLElement>('cardRef')
const previewRef = useTemplateRef<HTMLElement>('previewRef')
useChartPreview(previewRef)
const { downloadSvg, downloadPng, error: downloadError } = useImageExport(previewRef, cardRef)

const { lastNarrowExportTab } = exportPanelStore
const drawerOpen = computed({
  get: () => !!exportTab.value,
  set: (open) => {
    if (open) {
      setExportTabAction(lastNarrowExportTab.value)
    }
    else {
      setExportTabAction('' as ExportTab)
    }
  },
})

function onDrawerTabPick(tab: string) {
  setLastNarrowExportTab(tab as Exclude<ExportTab, ''>)
  setExportTabAction(tab as ExportTab)
}

const { sections: tabs } = useExportSections()

const TAB_LABELS: Record<string, string> = {
  embed: 'Embed',
  download: 'Download',
}

const panelTitle = computed(() => TAB_LABELS[exportTab.value] ?? 'Export')

const canvasClassList = computed(() => `export-panel__canvas--${resolvedCanvasMode.value}`)

</script>

<style scoped lang="scss">
.export-panel {
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

    :deep(.feedback-skeleton) {
      background: var(--export-panel-skeleton-fill);
    }

    .export-panel--narrow & {
      padding: 1rem;
    }

    &--light {
      background: #f5f5f5;
      --bc-canvas-dimension-color: rgba(0, 0, 0, 0.55);
      --export-panel-skeleton-fill: rgba(0, 0, 0, 0.08);
      --export-article-page-bg: #fff;
      --export-article-ink: rgba(0, 0, 0, 0.45);
    }

    &--dark {
      background: #0d0d0d;
      --bc-canvas-dimension-color: rgba(255, 255, 255, 0.45);
      --export-panel-skeleton-fill: rgba(237, 237, 237, 0.09);
      --export-article-page-bg: #000;
      --export-article-ink: rgba(237, 237, 237, 0.5);
    }

    &__card {
    position: relative;
    z-index: 1;
    background: var(--bs-card-bg);
    border: 1px solid var(--bc-frame-border);
    border-radius: var(--bc-frame-radius);
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

    &__preview {
      min-height: 200px;
    }
  }
  }

  // Same floating chrome as ChartEditPanel's view toolbar. Two scoped blocks of
  // eight lines beat inventing a shared floating-box component for two call
  // sites. This box lives inside the scrolling canvas, so it scrolls with the
  // content (see the plan's follow-ups).
  &__view-toolbar {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 4;
    display: flex;
    align-items: center;
    padding: 0.25rem;
    background: var(--bc-chrome-bg);
    border: 1px solid var(--bc-hairline);
    border-radius: var(--bc-radius-sm);
  }

  &__drawer-body {
    padding: 0.75rem;
  }
}

</style>
