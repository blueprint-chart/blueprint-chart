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
import { computed } from 'vue'
import { useEditorPanel } from '@/composables/useEditorPanel'
import { useExportPanel, type ExportTab } from '@/composables/useExportPanel'
import PanelFloating from '@/components/Panel/PanelFloating.vue'
import PanelTabBar from '@/components/Panel/PanelTabBar.vue'
import ExportEmbedPanel from './ExportEmbedPanel.vue'
import ExportDownloadPanel from './ExportDownloadPanel.vue'
import PanelStepperFooter from '@/components/Panel/PanelStepperFooter.vue'

defineProps<{
  containerRef: HTMLElement | null
}>()

defineEmits<{
  'download-png': [scale: number]
  'download-svg': []
}>()

const { floatingPosition, dock, collapse } = useEditorPanel()
const { exportTab, setExportTab } = useExportPanel()

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
