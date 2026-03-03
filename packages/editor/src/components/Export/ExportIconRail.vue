<template>
  <PanelIconRail
    :horizontal="horizontal"
    :active-tab="exportTab"
    :panel-mode="exportPanelMode"
    :items="items"
    @select="setExportTab($event as ExportTab)"
    @toggle-mode="toggleMode"
  />
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import PanelIconRail from '@/components/Panel/PanelIconRail.vue'
import { useExportPanel, type ExportTab } from '@/composables/useExportPanel'
import IPhCode from '~icons/ph/code'
import IPhDownloadSimple from '~icons/ph/download-simple'

defineProps<{
  horizontal?: boolean
}>()

const emit = defineEmits<{
  'toggle-mode': []
}>()

const { exportTab, setExportTab } = useExportPanel()

// Export panel uses a simpler panel mode (always docked, no floating)
const exportPanelMode = 'docked' as const

const items: { value: string, icon: Component, tooltip: string }[] = [
  { value: 'embed', icon: IPhCode, tooltip: 'Embed' },
  { value: 'download', icon: IPhDownloadSimple, tooltip: 'Download' },
]

function toggleMode() {
  emit('toggle-mode')
}
</script>
