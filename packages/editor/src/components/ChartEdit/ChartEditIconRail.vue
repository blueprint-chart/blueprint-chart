<template>
  <PanelIconRail
    :horizontal="horizontal"
    :active-tab="activeTab"
    :panel-mode="panelMode"
    :items="items"
    @select="selectTab"
    @toggle-mode="toggleMode"
  />
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { storeToRefs } from 'pinia'
import { useEditorPanel } from '@/stores/editorPanel'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import PanelIconRail from '@/components/Panel/PanelIconRail.vue'
import IPhChartBar from '~icons/ph/chart-bar'
import IPhTextAa from '~icons/ph/text-aa'
import IPhPalette from '~icons/ph/palette'
import IPhPuzzlePiece from '~icons/ph/puzzle-piece'
import IPhWaves from '~icons/ph/waves'
import IPhVectorTwo from '~icons/ph/vector-two'
import IPhPushPin from '~icons/ph/push-pin'

const AXIS_KEYS = ['showVerticalAxis', 'verticalAxisDirection', 'showVerticalTicks', 'verticalLabelPosition', 'verticalGridStyle', 'verticalNumberFormat', 'verticalScaleType', 'verticalRangeMin', 'verticalRangeMax', 'showHorizontalAxis', 'showHorizontalTicks', 'horizontalLabelPosition', 'horizontalGridStyle', 'horizontalNumberFormat', 'horizontalScaleType', 'horizontalRangeMin', 'horizontalRangeMax']

defineProps<{
  horizontal?: boolean
}>()

const editorPanel = useEditorPanel()
const { activeTab, panelMode } = storeToRefs(editorPanel)
const { toggleMode, selectTab } = editorPanel
const { chartType } = useChartConfig()
const { availableOptionKeys } = useChartTypeOptions()

const hasAxisOptions = computed(() => availableOptionKeys.value.some(k => AXIS_KEYS.includes(k)))

const items = computed(() => {
  const base: { value: string, icon: Component, tooltip: string }[] = [
    { value: 'type', icon: IPhChartBar, tooltip: 'Chart Type' },
    { value: 'text', icon: IPhTextAa, tooltip: 'Text' },
    { value: 'appearance', icon: IPhPalette, tooltip: 'Appearance' },
  ]
  if (['line-multi', 'bar-multi'].includes(chartType.value)) {
    base.push({ value: 'series', icon: IPhWaves, tooltip: 'Series' })
  }
  if (hasAxisOptions.value) {
    base.push({ value: 'axes', icon: IPhVectorTwo, tooltip: 'Axes' })
  }
  base.push({ value: 'annotate', icon: IPhPushPin, tooltip: 'Annotate' })
  base.push({ value: 'layout', icon: IPhPuzzlePiece, tooltip: 'Layout' })
  return base
})
</script>
