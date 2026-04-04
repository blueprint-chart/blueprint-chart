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
    <template #footer>
      <PanelStepperFooter />
    </template>
  </PanelFloating>
</template>

<script setup lang="ts">
import { useEditorPanel } from '@/stores/editorPanel'

defineProps<{
  containerRef: HTMLElement | null
}>()

const editorPanel = useEditorPanel()
const { dataPanelTab, floatingPosition } = storeToRefs(editorPanel)
const { dock, collapse } = editorPanel

const TAB_LABELS: Record<string, string> = {
  column: 'Column Settings',
  transforms: 'Transforms',
  parsing: 'Parsing',
  reco: 'Recommendations',
}

const panelTitle = computed(() => TAB_LABELS[dataPanelTab.value] ?? 'Panel')
</script>
