<template>
  <PanelDocked
    v-model="dockedPanelWidth"
    :collapsed="collapsed"
    :title="panelTitle"
    @float="float"
    @close="collapse"
  >
    <EditorChartTypePicker v-if="activeTab === 'type'" />
    <EditorPropertyForm v-else-if="activeTab === 'text'" />
    <EditorAppearanceTab v-else-if="activeTab === 'appearance'" />
    <EditorLayoutTab v-else-if="activeTab === 'layout'" />
    <EditorSeriesPanel v-else-if="activeTab === 'series'" />
    <EditorAxisOptions v-else-if="activeTab === 'axes'" />
    <EditorAnnotateTab v-else-if="activeTab === 'annotate'" />
  </PanelDocked>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEditorPanel } from '@/composables/useEditorPanel'
import PanelDocked from '@/components/Panel/PanelDocked.vue'
import EditorChartTypePicker from '@/components/Editor/EditorChartTypePicker.vue'
import EditorPropertyForm from '@/components/Editor/EditorPropertyForm.vue'
import EditorAppearanceTab from '@/components/Editor/EditorAppearanceTab.vue'
import EditorLayoutTab from '@/components/Editor/EditorLayoutTab.vue'
import EditorSeriesPanel from '@/components/Editor/EditorSeriesPanel.vue'
import EditorAxisOptions from '@/components/Editor/EditorAxisOptions.vue'
import EditorAnnotateTab from '@/components/Editor/EditorAnnotateTab.vue'

defineProps<{
  collapsed: boolean
}>()

const { activeTab, dockedPanelWidth, float, collapse } = useEditorPanel()

const TAB_LABELS: Record<string, string> = {
  type: 'Chart Type',
  text: 'Text',
  appearance: 'Appearance',
  layout: 'Layout',
  series: 'Series',
  axes: 'Axes',
  annotate: 'Annotate',
}

const panelTitle = computed(() => TAB_LABELS[activeTab.value] ?? 'Panel')
</script>
