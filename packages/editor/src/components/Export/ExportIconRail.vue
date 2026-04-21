<template>
  <PanelIconRail
    :horizontal="horizontal"
    :active-tab="exportTab"
    :items="items"
    @select="onSelect"
    @toggle-mode="toggleMode"
  />
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { usePanel } from '@/stores/panel'
import { useExportPanel, type ExportTab } from '@/stores/exportPanel'
import IPhCode from '~icons/ph/code'
import IPhDownloadSimple from '~icons/ph/download-simple'

defineProps<{
  horizontal?: boolean
}>()

const { mode: panelMode, toggleMode } = usePanel()
const exportPanelStore = useExportPanel()
const { exportTab } = storeToRefs(exportPanelStore)
const { setExportTab } = exportPanelStore

const items: { value: string, icon: Component, tooltip: string }[] = [
  { value: 'embed', icon: IPhCode, tooltip: 'Embed' },
  { value: 'download', icon: IPhDownloadSimple, tooltip: 'Download' },
]

function onSelect(tab: string | number) {
  setExportTab(tab as ExportTab)
  if (panelMode.value === 'closed') {
    toggleMode()
  }
}
</script>
