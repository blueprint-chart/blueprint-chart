<template>
  <PanelIconRail
    :active-tab="dataPanelTab"
    :items="items"
    @select="onSelect"
    @toggle-mode="onToggleMode"
  />
</template>

<script setup lang="ts">
import { useEditorPanel, type DataPanelTab } from '@/stores/editorPanel'
import { usePanel } from '@/stores/panel'
import { useDataSections } from '@/composables/useDataSections'

const props = withDefaults(defineProps<{
  disabledTabs?: string[]
}>(), {
  disabledTabs: () => [],
})

const editorPanel = useEditorPanel()
const { dataPanelTab } = storeToRefs(editorPanel)
const { openDataPanel } = editorPanel
const { mode: panelMode, toggleMode } = usePanel()
const { sections } = useDataSections()

const items = computed(() =>
  sections
    .filter(s => !props.disabledTabs.includes(s.key))
    .map(s => ({
      value: s.key,
      icon: s.icon,
      tooltip: s.tooltip ?? s.label,
    })),
)

function onSelect(tab: string | number) {
  openDataPanel(tab as DataPanelTab)
}

function onToggleMode() {
  if (panelMode.value === 'closed') {
    openDataPanel(dataPanelTab.value || 'column')
  }
  toggleMode()
}
</script>
