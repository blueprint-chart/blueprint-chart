<template>
  <NavigationIconRail
    :model-value="activeTab"
    :items="items"
    :horizontal="horizontal"
    @update:model-value="selectTab"
  >
    <template
      v-if="!horizontal"
      #footer
    >
      <ButtonIcon
        :icon-left="toggleIcon"
        :label="toggleLabel"
        hide-label
        square
        variant="link"
        size="sm"
        @click="toggleMode"
      />
    </template>
  </NavigationIconRail>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { NavigationIconRail, ButtonIcon } from '@blueprint-chart/ui'
import { useEditorPanel } from '@/composables/useEditorPanel'
import { useChartConfig } from '@/composables/useChartConfig'
import { useChartTypeOptions } from '@/composables/useChartTypeOptions'
import IPhChartBar from '~icons/ph/chart-bar'
import IPhTextAa from '~icons/ph/text-aa'
import IPhPalette from '~icons/ph/palette'
import IPhLayout from '~icons/ph/layout'
import IPhChartLineUp from '~icons/ph/chart-line-up'
import IPhGridNine from '~icons/ph/grid-nine'
import IPhPushPin from '~icons/ph/push-pin'
import IPhArrowsOutSimple from '~icons/ph/arrows-out-simple'
import IPhArrowsInSimple from '~icons/ph/arrows-in-simple'
import IPhSidebarSimple from '~icons/ph/sidebar-simple'

defineProps<{
  horizontal?: boolean
}>()

const AXIS_KEYS = ['showVerticalAxis', 'verticalAxisDirection', 'showVerticalTicks', 'verticalLabelPosition', 'verticalGridStyle', 'verticalNumberFormat', 'verticalScaleType', 'verticalRangeMin', 'verticalRangeMax', 'showHorizontalAxis', 'showHorizontalTicks', 'horizontalLabelPosition', 'horizontalGridStyle', 'horizontalNumberFormat', 'horizontalScaleType', 'horizontalRangeMin', 'horizontalRangeMax']

const { activeTab, panelMode, toggleMode, selectTab } = useEditorPanel()
const { chartType } = useChartConfig()
const { availableOptionKeys } = useChartTypeOptions()

const hasAxisOptions = computed(() => availableOptionKeys.value.some(k => AXIS_KEYS.includes(k)))

const items = computed(() => {
  const base: { value: string, icon: Component, tooltip: string }[] = [
    { value: 'type', icon: IPhChartBar, tooltip: 'Chart Type' },
    { value: 'text', icon: IPhTextAa, tooltip: 'Text' },
    { value: 'appearance', icon: IPhPalette, tooltip: 'Appearance' },
    { value: 'layout', icon: IPhLayout, tooltip: 'Layout' },
  ]
  if (['line-multi', 'bar-multi'].includes(chartType.value)) {
    base.push({ value: 'series', icon: IPhChartLineUp, tooltip: 'Series' })
  }
  if (hasAxisOptions.value) {
    base.push({ value: 'axes', icon: IPhGridNine, tooltip: 'Axes' })
  }
  base.push({ value: 'annotate', icon: IPhPushPin, tooltip: 'Annotate' })
  return base
})

const toggleIcon = computed(() => {
  if (panelMode.value === 'collapsed') { return IPhSidebarSimple }
  if (panelMode.value === 'floating') { return IPhArrowsInSimple }
  return IPhArrowsOutSimple
})

const toggleLabel = computed(() => {
  if (panelMode.value === 'collapsed') { return 'Open panel' }
  if (panelMode.value === 'floating') { return 'Dock panel' }
  return 'Detach panel'
})
</script>
