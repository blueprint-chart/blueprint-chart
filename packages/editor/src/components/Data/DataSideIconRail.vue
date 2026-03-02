<template>
  <PanelIconRail
    :horizontal="horizontal"
    :active-tab="dataPanelTab"
    :panel-mode="dataPanelMode"
    :items="items"
    @select="onSelect"
    @toggle-mode="onToggleMode"
  />
</template>

<script setup lang="ts">
import { type Component } from 'vue'
import { useEditorPanel, type DataPanelTab } from '@/composables/useEditorPanel'
import PanelIconRail from '@/components/Panel/PanelIconRail.vue'
import IPhColumns from '~icons/ph/columns'
import IPhFlowArrow from '~icons/ph/flow-arrow'
import IPhFileText from '~icons/ph/file-text'
import IPhLightbulb from '~icons/ph/lightbulb'

defineProps<{
  horizontal?: boolean
}>()

const { dataPanelTab, dataPanelMode, openDataPanel, dockDataPanel, floatDataPanel } = useEditorPanel()

const items: { value: string, icon: Component, tooltip: string }[] = [
  { value: 'column', icon: IPhColumns, tooltip: 'Columns' },
  { value: 'transforms', icon: IPhFlowArrow, tooltip: 'Transforms' },
  { value: 'parsing', icon: IPhFileText, tooltip: 'Parsing' },
  { value: 'reco', icon: IPhLightbulb, tooltip: 'Recommendations' },
]

function onSelect(tab: string | number) {
  openDataPanel(tab as DataPanelTab)
}

function onToggleMode() {
  if (dataPanelMode.value === 'docked') {
    floatDataPanel()
  }
  else if (dataPanelMode.value === 'floating') {
    dockDataPanel()
  }
  else {
    openDataPanel(dataPanelTab.value || 'column')
  }
}
</script>
