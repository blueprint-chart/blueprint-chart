<template>
  <BBadge
    :variant="badgeVariant"
    pill
    class="display-chart-type-badge"
  >
    <component
      :is="icon"
      class="display-chart-type-badge__icon"
    />
    {{ label }}
  </BBadge>
</template>

<script setup lang="ts">
import { BBadge } from 'bootstrap-vue-next'
import IPhChartBar from '~icons/ph/chart-bar'
import IPhChartBarHorizontal from '~icons/ph/chart-bar-horizontal'
import IPhChartLineUp from '~icons/ph/chart-line-up'
import IPhChartPieSlice from '~icons/ph/chart-pie-slice'
import IPhChartDonut from '~icons/ph/chart-donut'
import { getChartTypeLabel } from '../../../utils/chartType'

const props = withDefaults(defineProps<{
  chartType: string
  theme?: 'light' | 'dark'
}>(), {
  theme: 'light',
})

const label = computed(() => getChartTypeLabel(props.chartType))
const badgeVariant = computed(() => props.theme === 'dark' ? 'dark' : 'light')

const ICON_MAP: Record<string, object> = {
  'bar-vertical': IPhChartBar,
  'bar-horizontal': IPhChartBarHorizontal,
  'bar-multi': IPhChartBar,
  'column-stacked': IPhChartBar,
  'bar-stacked': IPhChartBarHorizontal,
  'line': IPhChartLineUp,
  'line-multi': IPhChartLineUp,
  'area': IPhChartLineUp,
  'area-stacked': IPhChartLineUp,
  'donut': IPhChartDonut,
  'pie': IPhChartPieSlice,
}

const icon = computed(() => ICON_MAP[props.chartType] ?? IPhChartBar)
</script>

<style scoped lang="scss">
.display-chart-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25em;
  white-space: nowrap;

  &__icon {
    font-size: 0.85em;
    flex-shrink: 0;
  }
}
</style>
