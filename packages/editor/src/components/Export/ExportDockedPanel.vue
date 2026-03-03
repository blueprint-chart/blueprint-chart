<template>
  <PanelDocked
    :collapsed="collapsed"
    :title="panelTitle"
    :initial-width="320"
    @float="$emit('float')"
    @close="$emit('close')"
  >
    <ExportEmbedPanel v-if="exportTab === 'embed'" />
    <ExportDownloadPanel
      v-else-if="exportTab === 'download'"
      @download-png="$emit('download-png', $event)"
      @download-svg="$emit('download-svg')"
    />
  </PanelDocked>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useExportPanel } from '@/composables/useExportPanel'
import PanelDocked from '@/components/Panel/PanelDocked.vue'
import ExportEmbedPanel from './ExportEmbedPanel.vue'
import ExportDownloadPanel from './ExportDownloadPanel.vue'

defineProps<{
  collapsed: boolean
}>()

defineEmits<{
  'float': []
  'close': []
  'download-png': [scale: number]
  'download-svg': []
}>()

const { exportTab } = useExportPanel()

const TAB_LABELS: Record<string, string> = {
  embed: 'Embed',
  download: 'Download',
}

const panelTitle = computed(() => TAB_LABELS[exportTab.value] ?? 'Export')
</script>
