<template>
  <PanelDocked
    :collapsed="collapsed"
    :title="panelTitle"
    @float="floatDataPanel"
    @close="closeDataPanel"
  >
    <DataColumnSettings v-if="dataPanelTab === 'column'" />
    <DataTransformPipeline v-else-if="dataPanelTab === 'transforms'" />
    <DataParseSettings v-else-if="dataPanelTab === 'parsing'" />
    <DataRecommendations v-else-if="dataPanelTab === 'reco'" />
  </PanelDocked>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEditorPanel } from '@/composables/useEditorPanel'
import PanelDocked from '@/components/Panel/PanelDocked.vue'
import DataColumnSettings from './DataColumnSettings.vue'
import DataTransformPipeline from './DataTransformPipeline.vue'
import DataParseSettings from './DataParseSettings.vue'
import DataRecommendations from './DataRecommendations.vue'

defineProps<{
  collapsed: boolean
}>()

const { dataPanelTab, floatDataPanel, closeDataPanel } = useEditorPanel()

const TAB_LABELS: Record<string, string> = {
  column: 'Column Settings',
  transforms: 'Transforms',
  parsing: 'Parsing',
  reco: 'Recommendations',
}

const panelTitle = computed(() => TAB_LABELS[dataPanelTab.value] ?? 'Panel')
</script>
