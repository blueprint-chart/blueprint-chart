<template>
  <div class="p-3 d-flex flex-column gap-3">
    <div
      ref="previewRef"
      class="export-preview border rounded bg-body"
    />
    <div class="d-flex gap-2">
      <ButtonIcon
        :icon-left="IPhDownloadSimple"
        label="Download PNG"
        variant="primary"
        size="sm"
        @click="downloadPng"
      />
      <ButtonIcon
        :icon-left="IPhDownloadSimple"
        label="Download SVG"
        variant="outline-primary"
        size="sm"
        @click="downloadSvg"
      />
    </div>
    <BFormGroup label="DSL Output">
      <BFormTextarea
        :model-value="dsl"
        rows="12"
        readonly
        class="font-monospace"
      />
    </BFormGroup>
    <BFormGroup label="Embed Code">
      <BFormTextarea
        :model-value="embedCode"
        rows="6"
        readonly
        class="font-monospace"
      />
    </BFormGroup>
  </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { ButtonIcon } from '@blueprint-chart/ui'
import IPhDownloadSimple from '~icons/ph/download-simple'
import { useDslOutput } from '@/composables/useDslOutput'
import { useChartPreview } from '@/composables/useChartPreview'
import { useImageExport } from '@/composables/useImageExport'

const previewRef = useTemplateRef<HTMLElement>('previewRef')
useChartPreview(previewRef)
const { downloadSvg, downloadPng } = useImageExport(previewRef)

const { dsl } = useDslOutput()

const scriptClose = '<' + '/script>'

const embedCode = computed(() => {
  const escaped = dsl.value.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return [
    '<div id="blueprint-chart"></div>',
    `<script src="https://blueprintchart.com/lib.js">${scriptClose}`,
    `<script type="application/blueprint-chart">`,
    escaped + scriptClose,
  ].join('\n')
})
</script>

<style scoped lang="scss">
.export-preview {
  min-height: 300px;
  overflow: hidden;
}
</style>
