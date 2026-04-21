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

    <SettingsSection
      v-if="hasArea"
      title="Areas"
      :icon="IPhChartLine"
    >
      <EditorAreaSection />
    </SettingsSection>
  </div>
</template>

<script setup lang="ts">
import { SettingsSection } from '@blueprint-chart/ui'
import { ChartType } from '@blueprint-chart/lib'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import IPhPalette from '~icons/ph/palette'
import IPhLineSegments from '~icons/ph/line-segments'
import IPhChartPieSlice from '~icons/ph/chart-pie-slice'
import IPhPaintBrush from '~icons/ph/paint-brush'
import IPhChartBar from '~icons/ph/chart-bar'
import IPhChartBarHorizontal from '~icons/ph/chart-bar-horizontal'
import IPhChartLine from '~icons/ph/chart-line'

const { chartType } = useChartConfig()
const { availableOptionKeys } = useChartTypeOptions()

const barStyleIcon = computed(() =>
  chartType.value.includes('horizontal') || chartType.value === ChartType.BarStacked || chartType.value === ChartType.BarSplit || chartType.value === ChartType.BarGrouped
    ? IPhChartBarHorizontal
    : IPhChartBar,
)

const hasArea = computed(() => availableOptionKeys.value.includes('stacked'))

const hasLineOptions = computed(() =>
  availableOptionKeys.value.includes('interpolation') || availableOptionKeys.value.includes('lineSymbols'),
)

const hasLine = computed(() => !hasArea.value && hasLineOptions.value)

const hasBarStyle = computed(() =>
  availableOptionKeys.value.includes('barBackground')
  || availableOptionKeys.value.includes('barSeparators')
  || availableOptionKeys.value.includes('barGap')
  || availableOptionKeys.value.includes('connectedColumns')
  || availableOptionKeys.value.includes('categoryLabelLine'),
)

const hasSlice = computed(() => availableOptionKeys.value.includes('displayAsPercentage'))
</script>
