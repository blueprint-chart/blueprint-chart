<template>
  <PanelDocked
    v-model="dockedPanelWidth"
    :collapsed="collapsed"
    :title="panelTitle"
    @float="$emit('float')"
    @close="$emit('close')"
  >
    <ExportEmbedPanel v-if="exportTab === 'embed'" />
    <ExportDownloadPanel
      v-else-if="exportTab === 'download'"
      @download-png="$emit('download-png', $event)"
      @download-svg="$emit('download-svg')"
    />
    <template #footer>
      <PanelStepperFooter />
    </template>
  </PanelDocked>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useEditorPanel } from '@/stores/editorPanel'
import { useExportPanel } from '@/stores/exportPanel'
import PanelDocked from '@/components/Panel/PanelDocked.vue'
import ExportEmbedPanel from './ExportEmbedPanel.vue'
import ExportDownloadPanel from './ExportDownloadPanel.vue'
import PanelStepperFooter from '@/components/Panel/PanelStepperFooter.vue'

defineProps<{
  collapsed: boolean
}>()

defineEmits<{
  'float': []
  'close': []
  'download-png': [scale: number]
  'download-svg': []
}>()

const { dockedPanelWidth } = storeToRefs(useEditorPanel())

const { exportTab } = storeToRefs(useExportPanel())

const TAB_LABELS: Record<string, string> = {
  embed: 'Embed',
  download: 'Download',
}

const panelTitle = computed(() => TAB_LABELS[exportTab.value] ?? 'Export')
</script>
