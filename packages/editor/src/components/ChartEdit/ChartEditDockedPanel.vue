<template>
  <div
    class="chart-edit-docked-panel"
    :class="panelClassList"
    :style="{ width: collapsed ? undefined : `${panelWidth}px` }"
  >
    <div
      class="chart-edit-docked-panel__resize-handle"
      @pointerdown="onResizeStart"
    />
    <LayoutPanel :title="panelTitle">
      <template #actions>
        <ButtonDetach @click="float" />
        <ButtonClose @click="collapse" />
      </template>
      <EditorChartTypePicker v-if="activeTab === 'type'" />
      <EditorPropertyForm v-else-if="activeTab === 'text'" />
      <EditorAppearanceTab v-else-if="activeTab === 'appearance'" />
      <EditorLayoutTab v-else-if="activeTab === 'layout'" />
      <EditorSeriesPanel v-else-if="activeTab === 'series'" />
      <EditorAxisOptions v-else-if="activeTab === 'axes'" />
      <EditorAnnotateTab v-else-if="activeTab === 'annotate'" />
    </LayoutPanel>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { LayoutPanel, ButtonDetach, ButtonClose } from '@blueprint-chart/ui'
import { useEditorPanel } from '@/composables/useEditorPanel'
import EditorChartTypePicker from '@/components/Editor/EditorChartTypePicker.vue'
import EditorPropertyForm from '@/components/Editor/EditorPropertyForm.vue'
import EditorAppearanceTab from '@/components/Editor/EditorAppearanceTab.vue'
import EditorLayoutTab from '@/components/Editor/EditorLayoutTab.vue'
import EditorSeriesPanel from '@/components/Editor/EditorSeriesPanel.vue'
import EditorAxisOptions from '@/components/Editor/EditorAxisOptions.vue'
import EditorAnnotateTab from '@/components/Editor/EditorAnnotateTab.vue'

const props = defineProps<{
  collapsed: boolean
}>()

const { activeTab, float, collapse } = useEditorPanel()

const panelClassList = computed(() => ({
  'chart-edit-docked-panel--collapsed': props.collapsed,
  'chart-edit-docked-panel--resizing': resizing.value,
}))

const MIN_WIDTH = 260
const MAX_WIDTH = 500
const panelWidth = ref(340)
const resizing = ref(false)

function onResizeStart(e: PointerEvent) {
  const startX = e.clientX
  const startWidth = panelWidth.value
  const target = e.currentTarget as HTMLElement
  target.setPointerCapture(e.pointerId)
  resizing.value = true

  function onMove(ev: PointerEvent) {
    const delta = startX - ev.clientX
    panelWidth.value = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta))
  }

  function onUp() {
    resizing.value = false
    target.removeEventListener('pointermove', onMove)
    target.removeEventListener('pointerup', onUp)
  }

  target.addEventListener('pointermove', onMove)
  target.addEventListener('pointerup', onUp)
}

const TAB_LABELS: Record<string, string> = {
  type: 'Chart Type',
  text: 'Text',
  appearance: 'Appearance',
  layout: 'Layout',
  series: 'Series',
  axes: 'Axes',
  annotate: 'Annotate',
}

const panelTitle = computed(() => TAB_LABELS[activeTab.value] ?? 'Panel')
</script>

<style scoped lang="scss">
.chart-edit-docked-panel {
  position: relative;
  min-width: 0;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.3s ease, max-width 0.3s ease, opacity 0.2s ease;

  &.chart-edit-docked-panel--resizing {
    transition: none;
  }

  &.chart-edit-docked-panel--collapsed {
    width: 0 !important;
    max-width: 0;
    opacity: 0;
    pointer-events: none;
  }
}

.chart-edit-docked-panel__resize-handle {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  cursor: col-resize;
  z-index: 10;

  &:hover,
  &:active {
    background: var(--bs-primary);
    opacity: 0.3;
  }
}
</style>
