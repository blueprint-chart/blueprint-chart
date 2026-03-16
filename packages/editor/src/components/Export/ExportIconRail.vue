<template>
  <PanelIconRail
    :horizontal="horizontal"
    :active-tab="exportTab"
    :panel-mode="panelMode"
    :items="items"
    @select="onSelect"
    @toggle-mode="toggleMode"
  />
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { storeToRefs } from 'pinia'
import PanelIconRail from '@/components/Panel/PanelIconRail.vue'
import { useEditorPanel } from '@/stores/editorPanel'
import { useExportPanel, type ExportTab } from '@/stores/exportPanel'
import IPhCode from '~icons/ph/code'
import IPhDownloadSimple from '~icons/ph/download-simple'

defineProps<{
  horizontal?: boolean
}>()

const editorPanel = useEditorPanel()
const { panelMode } = storeToRefs(editorPanel)
const { toggleMode } = editorPanel
const exportPanelStore = useExportPanel()
const { exportTab } = storeToRefs(exportPanelStore)
const { setExportTab } = exportPanelStore

const items: { value: string, icon: Component, tooltip: string }[] = [
  { value: 'embed', icon: IPhCode, tooltip: 'Embed' },
  { value: 'download', icon: IPhDownloadSimple, tooltip: 'Download' },
]

function onSelect(tab: string | number) {
  setExportTab(tab as ExportTab)
  if (panelMode.value === 'collapsed') {
    toggleMode()
  }
}
</script>
