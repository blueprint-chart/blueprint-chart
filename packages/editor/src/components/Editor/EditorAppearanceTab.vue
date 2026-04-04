<template>
  <div class="d-flex flex-column gap-4">
    <SettingsSection
      title="Theme"
      :icon="IPhPaintBrush"
    >
      <EditorThemeSection />
    </SettingsSection>

    <SettingsSection
      title="Colors"
      :icon="IPhPalette"
    >
      <EditorColorSection />
    </SettingsSection>

    <SettingsSection
      v-if="hasLine"
      title="Line Style"
      :icon="IPhLineSegments"
    >
      <EditorLineSection />
    </SettingsSection>

    <SettingsSection
      v-if="hasBarStyle"
      title="Bar Style"
      :icon="barStyleIcon"
    >
      <EditorBarStyleSection />
    </SettingsSection>

    <SettingsSection
      v-if="hasSlice"
      title="Slices"
      :icon="IPhChartPieSlice"
    >
      <EditorSliceSection />
    </SettingsSection>
  </div>
</template>

<script setup lang="ts">
import { SettingsSection } from '@blueprint-chart/ui'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import IPhPalette from '~icons/ph/palette'
import IPhLineSegments from '~icons/ph/line-segments'
import IPhChartPieSlice from '~icons/ph/chart-pie-slice'
import IPhPaintBrush from '~icons/ph/paint-brush'
import IPhChartBar from '~icons/ph/chart-bar'
import IPhChartBarHorizontal from '~icons/ph/chart-bar-horizontal'

const { chartType } = useChartConfig()
const { availableOptionKeys } = useChartTypeOptions()

const barStyleIcon = computed(() =>
  chartType.value.includes('horizontal') || chartType.value === 'bar-stacked'
    ? IPhChartBarHorizontal
    : IPhChartBar,
)

const hasLine = computed(() =>
  availableOptionKeys.value.includes('interpolation')
  || availableOptionKeys.value.includes('lineSymbols'),
)

const hasBarStyle = computed(() =>
  availableOptionKeys.value.includes('barBackground')
  || availableOptionKeys.value.includes('barSeparators'),
)

const hasSlice = computed(() => availableOptionKeys.value.includes('displayAsPercentage'))
</script>
