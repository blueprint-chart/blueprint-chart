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
        :model-value="activeTab"
        @update:model-value="selectTab"
      />
    </template>
    <template #toolbar>
      <ChartEditToolbar />
    </template>
    <EditorChartTypePicker v-if="activeTab === 'type'" />
    <EditorPropertyForm v-else-if="activeTab === 'text'" />
    <EditorAppearanceTab v-else-if="activeTab === 'style'" />
    <EditorSeriesPanel v-else-if="activeTab === 'series'" />
    <EditorAxisOptions v-else-if="activeTab === 'axes'" />
    <EditorLayoutTab v-else-if="activeTab === 'layout'" />
    <EditorAnnotateTab v-else-if="activeTab === 'annotate'" />
    <EditorInteractionsTab v-else-if="activeTab === 'interactions'" />
    <template #footer>
      <PanelStepperFooter />
    </template>
  </PanelFloating>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useEditorPanel } from '@/stores/editorPanel'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import { useScenes } from '@/stores/scenes'
import PanelFloating from '@/components/Panel/PanelFloating.vue'
import PanelTabBar from '@/components/Panel/PanelTabBar.vue'
import EditorChartTypePicker from '@/components/Editor/EditorChartTypePicker.vue'
import EditorPropertyForm from '@/components/Editor/EditorPropertyForm.vue'
import EditorAppearanceTab from '@/components/Editor/EditorAppearanceTab.vue'
import EditorLayoutTab from '@/components/Editor/EditorLayoutTab.vue'
import EditorSeriesPanel from '@/components/Editor/EditorSeriesPanel.vue'
import EditorAxisOptions from '@/components/Editor/EditorAxisOptions.vue'
import EditorAnnotateTab from '@/components/Editor/EditorAnnotateTab.vue'
import EditorInteractionsTab from '@/components/Editor/EditorInteractionsTab.vue'
import PanelStepperFooter from '@/components/Panel/PanelStepperFooter.vue'
import ChartEditToolbar from './ChartEditToolbar.vue'

const AXIS_KEYS = ['showVerticalAxis', 'verticalAxisDirection', 'showVerticalTicks', 'verticalLabelPosition', 'verticalGridStyle', 'verticalNumberFormat', 'verticalScaleType', 'verticalRangeMin', 'verticalRangeMax', 'showHorizontalAxis', 'showHorizontalTicks', 'horizontalLabelPosition', 'horizontalGridStyle', 'horizontalNumberFormat', 'horizontalScaleType', 'horizontalRangeMin', 'horizontalRangeMax']

defineProps<{
  containerRef: HTMLElement | null
}>()

const editorPanel = useEditorPanel()
const { activeTab, floatingPosition } = storeToRefs(editorPanel)
const { dock, collapse, selectTab } = editorPanel
const { chartType } = useChartConfig()
const { availableOptionKeys } = useChartTypeOptions()
const { scenes } = useScenes()

const hasAxisOptions = computed(() => availableOptionKeys.value.some(k => AXIS_KEYS.includes(k)))

const hasInteraction = computed(() =>
  availableOptionKeys.value.includes('tooltips')
  || availableOptionKeys.value.includes('crosshair')
  || scenes.value.length >= 1,
)

const tabs = computed(() => {
  const base: { key: string, label: string }[] = [
    { key: 'type', label: 'Type' },
    { key: 'text', label: 'Text' },
    { key: 'style', label: 'Style' },
  ]
  if (['line-multi', 'bar-multi'].includes(chartType.value)) {
    base.push({ key: 'series', label: 'Series' })
  }
  if (hasAxisOptions.value) {
    base.push({ key: 'axes', label: 'Axes' })
  }
  base.push({ key: 'layout', label: 'Layout' })
  base.push({ key: 'annotate', label: 'Annotate' })
  if (hasInteraction.value) {
    base.push({ key: 'interactions', label: 'Interactions' })
  }
  return base
})

const TAB_LABELS: Record<string, string> = {
  type: 'Chart Type',
  text: 'Text',
  style: 'Style',
  layout: 'Layout',
  series: 'Series',
  axes: 'Axes',
  annotate: 'Annotate',
  interactions: 'Interactions',
}

const panelTitle = computed(() => TAB_LABELS[activeTab.value] ?? 'Panel')
</script>
