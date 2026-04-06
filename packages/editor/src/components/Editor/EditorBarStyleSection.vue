<template>
  <div class="d-flex flex-column gap-3">
    <FormControlCheckbox
      v-if="hasBarBackground"
      :model-value="currentOptions.barBackground ?? false"
      label="Bar background"
      @update:model-value="(v) => setOption('barBackground', v)"
    />

    <FormControlCheckbox
      v-if="hasBarSeparators"
      :model-value="currentOptions.barSeparators ?? false"
      label="Bar separators"
      @update:model-value="(v) => setOption('barSeparators', v)"
    />

    <FormControlCheckbox
      v-if="hasWaterfall"
      :model-value="currentOptions.waterfall ?? false"
      label="Waterfall"
      @update:model-value="(v) => setOption('waterfall', v)"
    />

    <FormControlCheckbox
      v-if="hasWaterfallTotal && currentOptions.waterfall"
      :model-value="currentOptions.waterfallTotal ?? false"
      label="Waterfall total"
      @update:model-value="(v) => setOption('waterfallTotal', v)"
    />

    <FormControlCheckbox
      v-if="hasCategoryLabelLine"
      :model-value="currentOptions.categoryLabelLine ?? false"
      label="Labels on separate line"
      @update:model-value="(v) => setOption('categoryLabelLine', v)"
    />
  </div>
</template>

<script setup lang="ts">
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import { FormControlCheckbox } from '@blueprint-chart/ui'

const { currentOptions, availableOptionKeys, setOption } = useChartTypeOptions()

const hasBarBackground = computed(() => availableOptionKeys.value.includes('barBackground'))
const hasBarSeparators = computed(() => availableOptionKeys.value.includes('barSeparators'))
const hasWaterfall = computed(() => availableOptionKeys.value.includes('waterfall'))
const hasWaterfallTotal = computed(() => availableOptionKeys.value.includes('waterfallTotal'))
const hasCategoryLabelLine = computed(() => availableOptionKeys.value.includes('categoryLabelLine'))
</script>
