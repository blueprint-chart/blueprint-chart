<template>
  <PanelFloating
    :container-ref="containerRef"
    :title="panelTitle"
    :position="floatingPosition"
    @dock="dock"
    @close="collapse"
  >
    <DataColumnSettings v-if="dataPanelTab === 'column'" />
    <DataTransformPipeline v-else-if="dataPanelTab === 'transforms'" />
    <DataParseSettings v-else-if="dataPanelTab === 'parsing'" />
    <DataRecommendations v-else-if="dataPanelTab === 'reco'" />
  </PanelFloating>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEditorPanel } from '@/composables/useEditorPanel'
import PanelFloating from '@/components/Panel/PanelFloating.vue'
import DataColumnSettings from './DataColumnSettings.vue'
import DataTransformPipeline from './DataTransformPipeline.vue'
import DataParseSettings from './DataParseSettings.vue'
import DataRecommendations from './DataRecommendations.vue'

defineProps<{
  containerRef: HTMLElement | null
}>()

const { dataPanelTab, floatingPosition, dock, collapse } = useEditorPanel()

const TAB_LABELS: Record<string, string> = {
  column: 'Column Settings',
  transforms: 'Transforms',
  parsing: 'Parsing',
  reco: 'Recommendations',
}

const panelTitle = computed(() => TAB_LABELS[dataPanelTab.value] ?? 'Panel')
</script>
