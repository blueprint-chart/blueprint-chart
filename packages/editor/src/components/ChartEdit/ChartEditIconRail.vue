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
import type { Component } from 'vue'
import { useEditorPanel } from '@/stores/editorPanel'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import { useScenes } from '@/stores/scenes'
import IPhChartBar from '~icons/ph/chart-bar'
import IPhTextAa from '~icons/ph/text-aa'
import IPhPalette from '~icons/ph/palette'
import IPhPuzzlePiece from '~icons/ph/puzzle-piece'
import IPhWaves from '~icons/ph/waves'
import IPhVectorTwo from '~icons/ph/vector-two'
import IPhPushPin from '~icons/ph/push-pin'
import IPhCursorClick from '~icons/ph/cursor-click'

const AXIS_KEYS = ['showVerticalAxis', 'verticalAxisDirection', 'showVerticalTicks', 'verticalLabelPosition', 'verticalGridStyle', 'verticalNumberFormat', 'verticalScaleType', 'verticalRangeMin', 'verticalRangeMax', 'showHorizontalAxis', 'showHorizontalTicks', 'horizontalLabelPosition', 'horizontalGridStyle', 'horizontalNumberFormat', 'horizontalScaleType', 'horizontalRangeMin', 'horizontalRangeMax']

defineProps<{
  horizontal?: boolean
}>()

const editorPanel = useEditorPanel()
const { activeTab, panelMode } = storeToRefs(editorPanel)
const { toggleMode, selectTab } = editorPanel
const { chartType } = useChartConfig()
const { availableOptionKeys } = useChartTypeOptions()
const { scenes } = useScenes()

const hasAxisOptions = computed(() => availableOptionKeys.value.some(k => AXIS_KEYS.includes(k)))

const hasInteraction = computed(() =>
  availableOptionKeys.value.includes('tooltips')
  || availableOptionKeys.value.includes('crosshair')
  || scenes.value.length >= 1,
)

const items = computed(() => {
  const base: { value: string, icon: Component, tooltip: string }[] = [
    { value: 'type', icon: IPhChartBar, tooltip: 'Chart Type' },
    { value: 'text', icon: IPhTextAa, tooltip: 'Text' },
    { value: 'style', icon: IPhPalette, tooltip: 'Style' },
  ]
  if (['line-multi', 'bar-multi', 'bar-split'].includes(chartType.value)) {
    base.push({ value: 'series', icon: IPhWaves, tooltip: 'Series' })
  }
  if (hasAxisOptions.value) {
    base.push({ value: 'axes', icon: IPhVectorTwo, tooltip: 'Axes' })
  }
  base.push({ value: 'layout', icon: IPhPuzzlePiece, tooltip: 'Layout' })
  base.push({ value: 'annotate', icon: IPhPushPin, tooltip: 'Annotate' })
  if (hasInteraction.value) {
    base.push({ value: 'interactions', icon: IPhCursorClick, tooltip: 'Interactions' })
  }
  return base
})
</script>
