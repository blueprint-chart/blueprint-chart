<template>
  <div class="p-3 d-flex flex-column gap-3">
    <div
      ref="previewRef"
      class="export-preview border rounded bg-body"
    />
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
import { useDslOutput } from '@/composables/useDslOutput'
import { useChartPreview } from '@/composables/useChartPreview'

const previewRef = useTemplateRef<HTMLElement>('previewRef')
useChartPreview(previewRef)

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
