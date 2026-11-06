<template>
  <div class="d-flex flex-column gap-3">
    <FormControlCheckbox
      :model-value="enabled"
      label="Highlight specific items"
      @update:model-value="onToggle"
    />

    <template v-if="enabled">
      <ListSelectPanel
        v-model:selected="selectedTargets"
        :items="targetLabels"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { HighlightConfig } from '@blueprint-chart/lib'
import { ChartType, parseData, resolveScatterMapping } from '@blueprint-chart/lib'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import { FormControlCheckbox, ListSelectPanel } from '@blueprint-chart/ui'

const { chartType, data, highlights } = useChartConfig()
const { currentOptions } = useChartTypeOptions()

const parsed = computed(() => parseData(data.value))

const isMultiSeries = computed(() =>
  ([ChartType.LineMulti, ChartType.AreaStacked] as string[]).includes(chartType.value),
)

const scatterGroups = computed(() => {
  const { group } = resolveScatterMapping(parsed.value, currentOptions.value)
  const values = parsed.value.textColumns?.find(column => column.name === group)?.values ?? []
  return values.filter((value): value is string => !!value)
})

const targetLabels = computed(() => {
  if (isMultiSeries.value) {
    return parsed.value.series?.map(s => s.name) ?? []
  }
  if (chartType.value === ChartType.Scatter) {
    return [...new Set([...parsed.value.labels, ...scatterGroups.value])]
  }
  return parsed.value.labels
})

const enabled = shallowRef(highlights.value.length > 0)

const selectedTargets = computed<string[]>({
  get() {
    return highlights.value.map(h => h.target)
  },
  set(targets: string[]) {
    highlights.value = targets.map(t => ({ target: t }) satisfies HighlightConfig)
  },
})

function onToggle(val: boolean) {
  enabled.value = val
  if (!val) {
    highlights.value = []
  }
}
</script>
