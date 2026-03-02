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
    <EditorChartTypePicker v-if="activeTab === 'type'" />
    <EditorPropertyForm v-else-if="activeTab === 'text'" />
    <EditorAppearanceTab v-else-if="activeTab === 'appearance'" />
    <EditorLayoutTab v-else-if="activeTab === 'layout'" />
    <EditorSeriesPanel v-else-if="activeTab === 'series'" />
    <EditorAxisOptions v-else-if="activeTab === 'axes'" />
    <EditorAnnotateTab v-else-if="activeTab === 'annotate'" />
  </PanelFloating>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEditorPanel } from '@/composables/useEditorPanel'
import { useChartConfig } from '@/composables/useChartConfig'
import { useChartTypeOptions } from '@/composables/useChartTypeOptions'
import PanelFloating from '@/components/Panel/PanelFloating.vue'
import PanelTabBar from '@/components/Panel/PanelTabBar.vue'
import EditorChartTypePicker from '@/components/Editor/EditorChartTypePicker.vue'
import EditorPropertyForm from '@/components/Editor/EditorPropertyForm.vue'
import EditorAppearanceTab from '@/components/Editor/EditorAppearanceTab.vue'
import EditorLayoutTab from '@/components/Editor/EditorLayoutTab.vue'
import EditorSeriesPanel from '@/components/Editor/EditorSeriesPanel.vue'
import EditorAxisOptions from '@/components/Editor/EditorAxisOptions.vue'
import EditorAnnotateTab from '@/components/Editor/EditorAnnotateTab.vue'

const AXIS_KEYS = ['showVerticalAxis', 'verticalAxisDirection', 'showVerticalTicks', 'verticalLabelPosition', 'verticalGridStyle', 'verticalNumberFormat', 'verticalScaleType', 'verticalRangeMin', 'verticalRangeMax', 'showHorizontalAxis', 'showHorizontalTicks', 'horizontalLabelPosition', 'horizontalGridStyle', 'horizontalNumberFormat', 'horizontalScaleType', 'horizontalRangeMin', 'horizontalRangeMax']

defineProps<{
  containerRef: HTMLElement | null
}>()

const { activeTab, floatingPosition, dock, collapse, selectTab } = useEditorPanel()
const { chartType } = useChartConfig()
const { availableOptionKeys } = useChartTypeOptions()

const hasAxisOptions = computed(() => availableOptionKeys.value.some(k => AXIS_KEYS.includes(k)))

const tabs = computed(() => {
  const base: { key: string, label: string }[] = [
    { key: 'type', label: 'Type' },
    { key: 'text', label: 'Text' },
    { key: 'appearance', label: 'Appearance' },
    { key: 'layout', label: 'Layout' },
  ]
  if (['line-multi', 'bar-multi'].includes(chartType.value)) {
    base.push({ key: 'series', label: 'Series' })
  }
  if (hasAxisOptions.value) {
    base.push({ key: 'axes', label: 'Axes' })
  }
  base.push({ key: 'annotate', label: 'Annotate' })
  return base
})

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
