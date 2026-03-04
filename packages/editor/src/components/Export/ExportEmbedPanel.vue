<template>
  <div class="export-embed-panel">
    <ExportEmbedCodeBlock
      :step="1"
      label="Load the library"
      :code="libraryScript"
    />
    <ExportEmbedCodeBlock
      :step="2"
      label="Add the chart"
      :code="chartScript"
      :highlighted-html="chartScriptHtml"
    />
    <div class="export-embed-panel__info">
      Place both snippets in your HTML page. The chart renders automatically.
    </div>
    <ActionCopyButton
      :text="fullSnippet"
      label="Copy full snippet"
      variant="primary"
      size="sm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ActionCopyButton } from '@blueprint-chart/ui'
import { useDslOutput } from '@/composables/useDslOutput'
import { highlightDsl } from '@/dsl-lang'
import ExportEmbedCodeBlock from './ExportEmbedCodeBlock.vue'

const { dsl } = useDslOutput()

const scriptClose = '<' + '/script>'
const scriptOpen = '&lt;script type="application/blueprint-chart"&gt;'
const scriptCloseEscaped = '&lt;/script&gt;'

const libraryScript = '<script src="https://blueprintchart.com/lib.js">' + scriptClose

const chartScript = computed(() =>
  `<script type="application/blueprint-chart">\n${dsl.value}${scriptClose}`,
)

const chartScriptHtml = computed(() =>
  `${scriptOpen}\n${highlightDsl(dsl.value)}${scriptCloseEscaped}`,
)

const fullSnippet = computed(() =>
  [
    '<div id="blueprint-chart"></div>',
    libraryScript,
    chartScript.value,
  ].join('\n'),
)
</script>

<style scoped lang="scss">
.export-embed-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.export-embed-panel__info {
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
  line-height: 1.5;
}
</style>
