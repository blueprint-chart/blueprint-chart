<template>
  <PanelIconRail
    :active-tab="activeTab"
    :items="items"
    @select="selectTab"
    @toggle-mode="toggleMode"
  />
</template>

<script setup lang="ts">
import { useEditorPanel } from '@/stores/editorPanel'
import { usePanel } from '@/stores/panel'
import { useChartEditSections } from '@/composables/useChartEditSections'

const editorPanel = useEditorPanel()
const { activeTab } = editorPanel
const { selectTab } = editorPanel
const { toggleMode } = usePanel()
const { sections } = useChartEditSections()

const items = computed(() =>
  sections.value.map(s => ({
    value: s.key,
    icon: s.icon,
    tooltip: s.tooltip ?? s.label,
  })),
)
</script>
