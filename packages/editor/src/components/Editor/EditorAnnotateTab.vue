<template>
  <div class="d-flex flex-column gap-3">
    <EditorAnnotations
      :model-value="annotations"
      :labels="dataLabels"
      @update:model-value="(v) => annotations = v"
    />

    <hr v-if="isMultiLine">

    <EditorAreaFills
      v-if="isMultiLine"
      :model-value="areaFills"
      :series-names="seriesNames"
      @update:model-value="(v) => areaFills = v"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChartConfig } from '@/composables/useChartConfig'
import { parseData } from '@blueprint-chart/lib'
import EditorAnnotations from './EditorAnnotations.vue'
import EditorAreaFills from './EditorAreaFills.vue'

const { chartType, data, annotations, areaFills } = useChartConfig()

const isMultiLine = computed(() => chartType.value === 'line-multi')

const parsed = computed(() => parseData(data.value))
const dataLabels = computed(() => parsed.value.labels)
const seriesNames = computed(() => parsed.value.series?.map(s => s.name) ?? [])
</script>
