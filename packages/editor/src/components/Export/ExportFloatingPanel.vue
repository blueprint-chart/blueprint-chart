<template>
  <PanelFloating
    :container-ref="containerRef"
    :title="panelTitle"
    :position="floatingPosition"
    @dock="dock"
    @close="collapse"
  >
    <template #tabs>
      <PanelTabBar
        :tabs="tabs"
        :model-value="exportTab"
        @update:model-value="setExportTab($event as ExportTab)"
      />
    </template>
    <ExportEmbedPanel v-if="exportTab === 'embed'" />
    <ExportDownloadPanel
      v-else-if="exportTab === 'download'"
      @download-png="$emit('download-png', $event)"
      @download-svg="$emit('download-svg')"
    />
    <template #footer>
      <PanelStepperFooter />
    </template>
  </PanelFloating>
</template>

<script setup lang="ts">
import { useEditorPanel } from '@/stores/editorPanel'
import { useExportPanel, type ExportTab } from '@/stores/exportPanel'

defineProps<{
  containerRef: HTMLElement | null
}>()

defineEmits<{
  'download-png': [scale: number]
  'download-svg': []
}>()

const editorPanel = useEditorPanel()
const { floatingPosition } = storeToRefs(editorPanel)
const { dock, collapse } = editorPanel
const exportPanelStore = useExportPanel()
const { exportTab } = storeToRefs(exportPanelStore)
const { setExportTab } = exportPanelStore

const tabs = [
  { key: 'embed', label: 'Embed' },
  { key: 'download', label: 'Download' },
]

const TAB_LABELS: Record<string, string> = {
  embed: 'Embed',
  download: 'Download',
}

const panelTitle = computed(() => TAB_LABELS[exportTab.value] ?? 'Export')
</script>
