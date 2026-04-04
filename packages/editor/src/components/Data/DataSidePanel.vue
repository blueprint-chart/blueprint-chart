<template>
  <PanelDocked
    v-model="dockedPanelWidth"
    :collapsed="collapsed"
    :title="panelTitle"
    @float="float"
    @close="collapse"
  >
    <DataColumnSettings v-if="dataPanelTab === 'column'" />
    <DataTransformPipeline v-else-if="dataPanelTab === 'transforms'" />
    <DataParseSettings v-else-if="dataPanelTab === 'parsing'" />
    <DataRecommendations v-else-if="dataPanelTab === 'reco'" />
    <template #footer>
      <PanelStepperFooter />
    </template>
  </PanelDocked>
</template>

<script setup lang="ts">
import { useEditorPanel } from '@/stores/editorPanel'

defineProps<{
  collapsed: boolean
}>()

const editorPanel = useEditorPanel()
const { dataPanelTab, dockedPanelWidth } = storeToRefs(editorPanel)
const { float, collapse } = editorPanel

const TAB_LABELS: Record<string, string> = {
  column: 'Column Settings',
  transforms: 'Transforms',
  parsing: 'Parsing',
  reco: 'Recommendations',
}

const panelTitle = computed(() => TAB_LABELS[dataPanelTab.value] ?? 'Panel')
</script>
