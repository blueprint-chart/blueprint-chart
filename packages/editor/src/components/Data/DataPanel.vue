<template>
  <div
    class="data-panel"
    :class="{ 'data-panel--structure': dataView === 'structure' }"
  >
    <DataUploadCard
      v-if="dataView === 'upload'"
      @loaded="onLoaded"
      @bpc="onBpcLoaded"
      @sample="onSampleLoaded"
    />
    <DataStructurePanel v-else />
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useEditorPanel } from '@/composables/useEditorPanel'
import { useDataTable } from '@/composables/useDataTable'
import { useDslSync } from '@/composables/useDslSync'
import { useChartSession } from '@/composables/useChartSession'
import { useWizard } from '@/composables/useWizard'
import { parseDelimited } from '@/composables/useDataParser'
import { useParseOptions } from '@/composables/useParseOptions'
import type { ChartSample } from '@blueprint-chart/lib'
import DataUploadCard from './DataUploadCard.vue'
import DataStructurePanel from './DataStructurePanel.vue'

const { dataView, setDataView } = useEditorPanel()
const dataTable = useDataTable()
const { applyDsl } = useDslSync()
const { loadSample } = useChartSession()
const wizard = useWizard()
const parseOptions = useParseOptions()

onMounted(() => {
  if (dataTable.columns.value.length > 0) {
    setDataView('structure')
  }
  else {
    setDataView('upload')
  }
})

function reparseData() {
  if (!dataTable.rawInput.value) {
    return
  }
  const parsed = parseDelimited(dataTable.rawInput.value, {
    firstRowIsHeader: parseOptions.firstRowIsHeader.value,
    delimiter: parseOptions.delimiter.value,
    decimalSeparator: parseOptions.decimalSeparator.value,
    trimWhitespace: parseOptions.trimWhitespace.value,
  })
  dataTable.loadParsed(parsed)
}

function onLoaded(content: string, label: string) {
  dataTable.rawInput.value = content
  dataTable.sourceFormat.value = 'delimited'
  dataTable.sourceLabel.value = label || 'Pasted'
  reparseData()
  setDataView('structure')
}

function onBpcLoaded(content: string, label: string) {
  applyDsl(content)
  dataTable.sourceLabel.value = label || 'Blueprint file'
  wizard.hydrate({ currentIndex: 1, furthestIndex: 1 })
  setDataView('structure')
}

function onSampleLoaded(sample: ChartSample) {
  loadSample(sample)
  setDataView('structure')
}

watch(
  [
    () => parseOptions.firstRowIsHeader.value,
    () => parseOptions.delimiter.value,
    () => parseOptions.decimalSeparator.value,
    () => parseOptions.trimWhitespace.value,
  ],
  () => {
    if (dataTable.rawInput.value && dataView.value === 'structure') {
      reparseData()
    }
  },
)
</script>

<style scoped lang="scss">
.data-panel {
  // Upload view — centered container layout
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  background: var(--bc-void-bg);

  // Structure view — full-bleed flex layout matching ChartEditPanel
  &--structure {
    display: flex;
    flex: 1;
    overflow: hidden;
    max-width: none;
    gap: var(--bc-tile-gap);
  }
}

// Match ChartEditPanel: ensure layout panel matches the tile surface
.data-panel--structure {
  :deep(.layout-panel) {
    background: var(--bc-tile-bg);
  }
}
</style>
