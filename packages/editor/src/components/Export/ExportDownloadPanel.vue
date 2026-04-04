<template>
  <div class="export-download-panel">
    <ExportDownloadFormatCard
      :selected="selectedFormat === 'png'"
      :icon="IPhImage"
      label="PNG"
      description="Raster image, best for presentations"
      icon-bg="var(--bs-info-bg-subtle)"
      icon-color="var(--bs-info-text-emphasis)"
      @select="setSelectedFormat('png')"
      @download="onDownloadPng"
    >
      <FormControlSliderInput
        id="png-scale"
        :model-value="pngScale"
        label="Scale"
        :min="1"
        :max="4"
        :step="1"
        @update:model-value="pngScale = $event"
      />
    </ExportDownloadFormatCard>

    <ExportDownloadFormatCard
      :selected="selectedFormat === 'svg'"
      :icon="IPhFileCode"
      label="SVG"
      description="Vector image, best for print and web"
      icon-bg="var(--bs-success-bg-subtle)"
      icon-color="var(--bs-success-text-emphasis)"
      @select="setSelectedFormat('svg')"
      @download="onDownloadSvg"
    >
      <BFormCheckbox
        v-model="svgInlineFonts"
        switch
      >
        Inline fonts
      </BFormCheckbox>
      <BFormCheckbox
        v-model="svgMinify"
        switch
      >
        Minify
      </BFormCheckbox>
    </ExportDownloadFormatCard>

    <ExportDownloadFormatCard
      :selected="selectedFormat === 'bpc'"
      :icon="IPhFileText"
      label="BPC"
      description="Blueprint Chart DSL file"
      icon-bg="var(--bs-warning-bg-subtle)"
      icon-color="var(--bs-warning-text-emphasis)"
      @select="setSelectedFormat('bpc')"
      @download="onDownloadBpc"
    >
      <BFormCheckbox
        v-model="bpcCompact"
        switch
      >
        Compact
      </BFormCheckbox>
    </ExportDownloadFormatCard>
  </div>
</template>

<script setup lang="ts">
import { FormControlSliderInput } from '@blueprint-chart/ui'
import { triggerDownload } from '@/utils/export/image'
import { useExportPanel } from '@/stores/exportPanel'
import IPhImage from '~icons/ph/image'
import IPhFileCode from '~icons/ph/file-code'
import IPhFileText from '~icons/ph/file-text'

const exportPanelStore = useExportPanel()
const { selectedFormat, pngScale, svgInlineFonts, svgMinify, bpcCompact } = storeToRefs(exportPanelStore)
const { setSelectedFormat } = exportPanelStore
const { dsl } = useDslOutput()

const emit = defineEmits<{
  'download-png': [scale: number]
  'download-svg': []
}>()

function onDownloadPng() {
  emit('download-png', pngScale.value)
}

function onDownloadSvg() {
  emit('download-svg')
}

function onDownloadBpc() {
  triggerDownload(new globalThis.Blob([dsl.value], { type: 'text/plain' }), 'chart.bpc')
}
</script>

<style scoped lang="scss">
.export-download-panel {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
