<template>
  <div
    class="data-panel"
    :class="{ 'data-panel--structure': dataView === 'structure' }"
  >
    <DataUploadCard
      v-if="dataView === 'upload'"
      @loaded="onLoaded"
      @bpc="onBpcLoaded"
    />
    <DataStructurePanel v-else />
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useEditorPanel } from '@/composables/useEditorPanel'
import { useDataTable } from '@/composables/useDataTable'
import { useDslSync } from '@/composables/useDslSync'
import { useChartConfig } from '@/composables/useChartConfig'
import { useWizard } from '@/composables/useWizard'
import { parseDelimited } from '@/composables/useDataParser'
import { useParseOptions } from '@/composables/useParseOptions'
import DataUploadCard from './DataUploadCard.vue'
import DataStructurePanel from './DataStructurePanel.vue'

const { dataView, setDataView } = useEditorPanel()
const dataTable = useDataTable()
const { applyDsl } = useDslSync()
const chartConfig = useChartConfig()
const wizard = useWizard()
const parseOptions = useParseOptions()

onMounted(() => {
  if (dataTable.columns.value.length > 0) {
    setDataView('structure')
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

function onLoaded(content: string) {
  dataTable.rawInput.value = content
  dataTable.sourceFormat.value = 'delimited'
  reparseData()
  setDataView('structure')
}

function onBpcLoaded(content: string) {
  applyDsl(content)
  dataTable.rawInput.value = chartConfig.data.value
  dataTable.sourceFormat.value = 'bpc'
  reparseData()
  wizard.hydrate({ currentIndex: 1, furthestIndex: 1 })
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
  padding: 1.5rem;
  width: 100%;

  // Structure view — full-bleed flex layout matching ChartEditPanel
  &--structure {
    display: flex;
    flex: 1;
    overflow: hidden;
    max-width: none;
    padding: 0;
  }
}

// Match ChartEditPanel: ensure icon rail & layout panel have body-bg background
.data-panel--structure {
  :deep(.navigation-icon-rail),
  :deep(.layout-panel) {
    background: var(--bs-body-bg);
  }
}
</style>
