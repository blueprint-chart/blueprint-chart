<template>
  <PanelIconRail
    :active-tab="exportTab"
    :items="items"
    @select="onSelect"
    @toggle-mode="toggleMode"
  />
</template>

<script setup lang="ts">
import { usePanel } from '@/stores/panel'
import { useExportPanel, type ExportTab } from '@/stores/exportPanel'
import { useExportSections } from '@/composables/useExportSections'

const { mode: panelMode, toggleMode } = usePanel()
const exportPanelStore = useExportPanel()
const { exportTab } = storeToRefs(exportPanelStore)
const { setExportTab } = exportPanelStore
const { sections } = useExportSections()

const items = computed(() =>
  sections.map(s => ({
    value: s.key,
    icon: s.icon,
    tooltip: s.tooltip ?? s.label,
  })),
)

function onSelect(tab: string | number) {
  setExportTab(tab as ExportTab)
  if (panelMode.value === 'closed') {
    toggleMode()
  }
}
</script>
