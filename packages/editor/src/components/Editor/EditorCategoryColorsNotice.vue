<script setup lang="ts">
import { ButtonIcon } from '@blueprint-chart/ui'
import { parseData } from '@blueprint-chart/lib'
import { useChartConfig } from '@/stores/chartConfig'
import { useCategoryColors } from '@/stores/categoryColors'
import { findCategoryColorMatches } from '@/utils/categoryColorMatches'

const { chartType, data, colorizes, seriesOverrides } = useChartConfig()
const { categoryColors } = useCategoryColors()

const matches = computed(() => findCategoryColorMatches({
  chartType: chartType.value,
  data: parseData(data.value),
  colorizes: colorizes.value,
  seriesOverrides: seriesOverrides.value,
  categoryColors: categoryColors.value,
}))

const message = computed(() => matches.value.length === 1
  ? '1 category matches your colors'
  : `${matches.value.length} categories match your colors`)

function apply() {
  colorizes.value = [...colorizes.value, ...matches.value]
}
</script>

<template>
  <div
    v-if="matches.length"
    class="editor-category-colors-notice d-flex align-items-center justify-content-between gap-2 p-2 rounded bg-body-secondary"
  >
    <span class="editor-category-colors-notice__message">{{ message }}</span>
    <ButtonIcon
      class="editor-category-colors-notice__apply"
      label="Apply"
      size="sm"
      variant="primary"
      @click="apply"
    />
  </div>
</template>
