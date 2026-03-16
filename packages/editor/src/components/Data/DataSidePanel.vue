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
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useEditorPanel } from '@/stores/editorPanel'
import PanelDocked from '@/components/Panel/PanelDocked.vue'
import DataColumnSettings from './DataColumnSettings.vue'
import DataTransformPipeline from './DataTransformPipeline.vue'
import DataParseSettings from './DataParseSettings.vue'
import DataRecommendations from './DataRecommendations.vue'
import PanelStepperFooter from '@/components/Panel/PanelStepperFooter.vue'

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
