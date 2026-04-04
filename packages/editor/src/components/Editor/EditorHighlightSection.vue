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
import { parseData } from '@blueprint-chart/lib'
import { useChartConfig } from '@/stores/chartConfig'
import { FormControlCheckbox, ListSelectPanel } from '@blueprint-chart/ui'

const { chartType, data, highlights } = useChartConfig()

const parsed = computed(() => parseData(data.value))

const isMultiSeries = computed(() =>
  ['line-multi', 'area-stacked'].includes(chartType.value),
)

const targetLabels = computed(() =>
  isMultiSeries.value
    ? (parsed.value.series?.map(s => s.name) ?? [])
    : parsed.value.labels,
)

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
