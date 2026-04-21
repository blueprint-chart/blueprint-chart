<template>
  <PanelIconRail
    :horizontal="horizontal"
    :active-tab="dataPanelTab"
    :items="items"
    @select="onSelect"
    @toggle-mode="onToggleMode"
  />
</template>

<script setup lang="ts">
import { type Component } from 'vue'
import { useEditorPanel, type DataPanelTab } from '@/stores/editorPanel'
import { usePanel } from '@/stores/panel'
import IPhColumns from '~icons/ph/columns'
import IPhFlowArrow from '~icons/ph/flow-arrow'
import IPhFileText from '~icons/ph/file-text'
import IPhLightbulb from '~icons/ph/lightbulb'

const props = withDefaults(defineProps<{
  horizontal?: boolean
  disabledTabs?: string[]
}>(), {
  disabledTabs: () => [],
})

const editorPanel = useEditorPanel()
const { dataPanelTab } = storeToRefs(editorPanel)
const { openDataPanel } = editorPanel
const { mode: panelMode, toggleMode } = usePanel()

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
  if (panelMode.value === 'closed') {
    openDataPanel(dataPanelTab.value || 'column')
  }
  toggleMode()
}
</script>
