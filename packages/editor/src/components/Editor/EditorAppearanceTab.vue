<template>
  <div class="d-flex flex-column gap-4">
    <SettingsSection
      v-if="hasColumnChoice"
      title="Columns"
      :icon="IPhTable"
    >
      <EditorDataColumnSection />
    </SettingsSection>

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
      v-if="hasStack"
      title="Stacking"
      :icon="IPhStack"
    >
      <EditorStackSection />
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

    <SettingsSection
      v-if="hasScatter"
      title="Columns"
      :icon="IPhTable"
    >
      <EditorScatterColumns />
    </SettingsSection>

    <SettingsSection
      v-if="hasScatter"
      title="Points"
      :icon="IPhChartScatter"
    >
      <EditorScatterPoints />
    </SettingsSection>

    <SettingsSection
      v-if="hasDotPlot"
      title="Dots"
      :icon="IPhTable"
    >
      <EditorDotPlotSettings />
    </SettingsSection>

    <SettingsSection
      title="Sort"
      :icon="IPhSortAscending"
    >
      <EditorSortSection />
    </SettingsSection>
  </div>
</template>

<script setup lang="ts">
import { SettingsSection } from '@blueprint-chart/ui'
import { ChartType } from '@blueprint-chart/lib'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import { useDataTable } from '@/stores/dataTable'
import { SINGLE_SERIES_TYPES } from '@/utils/chart/chartRender'
import IPhPalette from '~icons/ph/palette'
import IPhLineSegments from '~icons/ph/line-segments'
import IPhChartPieSlice from '~icons/ph/chart-pie-slice'
import IPhPaintBrush from '~icons/ph/paint-brush'
import IPhChartBar from '~icons/ph/chart-bar'
import IPhChartBarHorizontal from '~icons/ph/chart-bar-horizontal'
import IPhChartLine from '~icons/ph/chart-line'
import IPhSortAscending from '~icons/ph/sort-ascending'
import IPhTable from '~icons/ph/table'
import IPhChartScatter from '~icons/ph/chart-scatter'
import IPhStack from '~icons/ph/stack'

const { chartType } = useChartConfig()
const { availableOptionKeys } = useChartTypeOptions()
const dataTable = useDataTable()

const hasColumnChoice = computed(() => {
  return SINGLE_SERIES_TYPES.includes(chartType.value) && dataTable.columns.value.length > 2
})

const hasStack = computed(() => availableOptionKeys.value.includes('stackMode'))

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

const hasScatter = computed(() => availableOptionKeys.value.includes('trend'))
const hasDotPlot = computed(() => availableOptionKeys.value.includes('arrows'))

const hasSlice = computed(() => availableOptionKeys.value.includes('displayAsPercentage'))
</script>
