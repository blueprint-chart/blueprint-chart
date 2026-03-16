<template>
  <PanelIconRail
    :horizontal="horizontal"
    :active-tab="dataPanelTab"
    :panel-mode="panelMode"
    :items="items"
    @select="onSelect"
    @toggle-mode="onToggleMode"
  />
</template>

<script setup lang="ts">
import { type Component } from 'vue'
import { storeToRefs } from 'pinia'
import { useEditorPanel, type DataPanelTab } from '@/stores/editorPanel'
import PanelIconRail from '@/components/Panel/PanelIconRail.vue'
import IPhColumns from '~icons/ph/columns'
import IPhFlowArrow from '~icons/ph/flow-arrow'
import IPhFileText from '~icons/ph/file-text'
import IPhLightbulb from '~icons/ph/lightbulb'

import { computed } from 'vue'

const props = withDefaults(defineProps<{
  horizontal?: boolean
  disabledTabs?: string[]
}>(), {
  disabledTabs: () => [],
})

const editorPanel = useEditorPanel()
const { dataPanelTab, panelMode } = storeToRefs(editorPanel)
const { openDataPanel, toggleMode } = editorPanel

const allItems: { value: string, icon: Component, tooltip: string }[] = [
  { value: 'column', icon: IPhColumns, tooltip: 'Columns' },
  { value: 'transforms', icon: IPhFlowArrow, tooltip: 'Transforms' },
  { value: 'parsing', icon: IPhFileText, tooltip: 'Parsing' },
  { value: 'reco', icon: IPhLightbulb, tooltip: 'Recommendations' },
]

const items = computed(() =>
  allItems.filter(i => !props.disabledTabs.includes(i.value)),
)

function onSelect(tab: string | number) {
  openDataPanel(tab as DataPanelTab)
}

function onToggleMode() {
  if (panelMode.value === 'collapsed') {
    openDataPanel(dataPanelTab.value || 'column')
  }
  toggleMode()
}
</script>
