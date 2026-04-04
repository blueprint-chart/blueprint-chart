<template>
  <PanelDocked
    v-model="dockedPanelWidth"
    :collapsed="collapsed"
    :title="panelTitle"
    @float="float"
    @close="collapse"
  >
    <template #toolbar>
      <ChartEditToolbar />
    </template>
    <EditorChartTypePicker v-if="activeTab === 'type'" />
    <EditorPropertyForm v-else-if="activeTab === 'text'" />
    <EditorAppearanceTab v-else-if="activeTab === 'style'" />
    <EditorSeriesPanel v-else-if="activeTab === 'series'" />
    <EditorAxisOptions v-else-if="activeTab === 'axes'" />
    <EditorLayoutTab v-else-if="activeTab === 'layout'" />
    <EditorAnnotateTab v-else-if="activeTab === 'annotate'" />
    <EditorInteractionsTab v-else-if="activeTab === 'interactions'" />
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
const { activeTab, dockedPanelWidth } = storeToRefs(editorPanel)
const { float, collapse } = editorPanel

const TAB_LABELS: Record<string, string> = {
  type: 'Chart Type',
  text: 'Text',
  style: 'Style',
  layout: 'Layout',
  series: 'Series',
  axes: 'Axes',
  annotate: 'Annotate',
  interactions: 'Interactions',
}

const panelTitle = computed(() => TAB_LABELS[activeTab.value] ?? 'Panel')
</script>
