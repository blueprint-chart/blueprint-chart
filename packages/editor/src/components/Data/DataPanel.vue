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
      @cancel="setDataView('structure')"
    />
    <DataStructurePanel v-else />
  </div>
</template>

<script setup lang="ts">
import { useEditorPanel } from '@/stores/editorPanel'
import { useDataTable, serializeTableData } from '@/stores/dataTable'
import { useChartSession } from '@/stores/chartSession'
import { useWizard } from '@/stores/wizard'
import { useParseOptions } from '@/stores/parseOptions'
import { useScenes } from '@/stores/scenes'
import type { ChartSample } from '@blueprint-chart/lib'

const editorPanel = useEditorPanel()
const { dataView } = storeToRefs(editorPanel)
const { setDataView } = editorPanel
const dataTable = useDataTable()
const { applyDsl } = useDslSync()
const { loadSample } = useChartSession()
const { next } = useWizard()
const parseOptions = storeToRefs(useParseOptions())
const { activeScene, activeIndex, update: updateScene } = useScenes()
const isSceneMode = computed(() => activeScene.value !== null)

onMounted(() => {
  if (dataTable.columns.value.length > 0) {
    setDataView('structure')
  }
  else {
    setDataView('upload')
  }
})

function reparseData() {
  if (!dataTable.rawInput.value || dataTable.sourceFormat.value !== 'delimited') {
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
  if (isSceneMode.value && activeIndex.value >= 0) {
    const parsed = parseDelimited(content, {
      firstRowIsHeader: parseOptions.firstRowIsHeader.value,
      delimiter: parseOptions.delimiter.value,
      decimalSeparator: parseOptions.decimalSeparator.value,
      trimWhitespace: parseOptions.trimWhitespace.value,
    })
    const dslData = serializeTableData(parsed.columns, parsed.rows)
    updateScene(activeIndex.value, { data: dslData })
    setDataView('structure')
    return
  }
  dataTable.rawInput.value = content
  dataTable.sourceFormat.value = 'delimited'
  dataTable.sourceLabel.value = label || 'Pasted'
  reparseData()
  setDataView('structure')
}

function onBpcLoaded(content: string, label: string) {
  applyDsl(content)
  dataTable.sourceLabel.value = label || 'Blueprint file'
  next()
}

function onSampleLoaded(sample: ChartSample) {
  if (isSceneMode.value && activeIndex.value >= 0) {
    updateScene(activeIndex.value, { data: sample.serializedData })
    setDataView('structure')
    return
  }
  loadSample(sample)
  next()
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
  background: var(--bc-content-bg);

  // Structure view — full-bleed flex layout matching ChartEditPanel
  &--structure {
    display: flex;
    flex: 1;
    overflow: hidden;
    max-width: none;
    gap: 8px;

  }
}
</style>
