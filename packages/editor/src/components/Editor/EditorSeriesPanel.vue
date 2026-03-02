<template>
  <div class="d-flex flex-column gap-3">
    <h6 class="fw-bold mb-0">
      Series
    </h6>

    <EditorSeriesList
      :series-names="seriesNames"
      :selected="selected"
      :colors="colors"
      :overrides="seriesOverrides"
      @update:selected="selected = $event"
      @toggle-visibility="onToggleVisibility"
    />

    <SectionCard
      v-if="selected.length > 0"
      :label="'Editing ' + selected.length + ' ' + (selected.length === 1 ? 'series: ' + selected[0] : 'series')"
    >
      <EditorSeriesOptions
        :selected="selected"
        :overrides="seriesOverrides"
        :colors="colors"
        :chart-type="chartType"
        @update:overrides="seriesOverrides = $event"
      />
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChartConfig } from '@/composables/useChartConfig'
import { useChartTypeOptions } from '@/composables/useChartTypeOptions'
import { parseData, buildChartOptions } from '@blueprint-chart/lib'
import type { SeriesOverride } from '@blueprint-chart/lib'
import { SectionCard } from '@blueprint-chart/ui'
import EditorSeriesList from './EditorSeriesList.vue'
import EditorSeriesOptions from './EditorSeriesOptions.vue'

const { chartType, data, seriesOverrides } = useChartConfig()
const { currentOptions } = useChartTypeOptions()

const selected = ref<string[]>([])

const seriesNames = computed(() => {
  const parsed = parseData(data.value)
  return parsed.series?.map(s => s.name) ?? []
})

const colors = computed(() => {
  const opts = buildChartOptions(currentOptions.value)
  return opts.colors ?? ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7']
})

function onToggleVisibility(name: string, hidden: boolean) {
  const copy = seriesOverrides.value.map((o: SeriesOverride) => ({ ...o }))
  let entry = copy.find((o: SeriesOverride) => o.name === name)
  if (!entry) {
    entry = { name }
    copy.push(entry)
  }
  entry.hidden = hidden
  seriesOverrides.value = copy
}
</script>
