<script lang="ts">
const dismissedCharts = reactive(new Set<string>())
</script>

<script setup lang="ts">
import { ButtonIcon } from '@blueprint-chart/ui'
import { parseData } from '@blueprint-chart/lib'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartSession } from '@/stores/chartSession'
import { useCategoryColors } from '@/stores/categoryColors'
import { findAppliedCategoryColors, findCategoryColorMatches, hasColorizeList } from '@/utils/categoryColorMatches'
import IPhX from '~icons/ph/x'

const { chartType, data, colorizes, seriesOverrides } = useChartConfig()
const { categoryColors } = useCategoryColors()
const { sessionId } = useChartSession()

const dismissed = computed(() => dismissedCharts.has(sessionId.value))

const matches = computed(() => dismissed.value
  ? []
  : findCategoryColorMatches({
      chartType: chartType.value,
      data: parseData(data.value),
      colorizes: colorizes.value,
      seriesOverrides: seriesOverrides.value,
      categoryColors: categoryColors.value,
    }))

const applied = computed(() => hasColorizeList(chartType.value)
  ? []
  : findAppliedCategoryColors(colorizes.value, categoryColors.value))

const message = computed(() => {
  if (matches.value.length) {
    return matches.value.length === 1
      ? '1 category matches your colors'
      : `${matches.value.length} categories match your colors`
  }
  return applied.value.length === 1
    ? '1 category color applied'
    : `${applied.value.length} category colors applied`
})

function apply() {
  colorizes.value = [...colorizes.value, ...matches.value]
}

function dismiss() {
  dismissedCharts.add(sessionId.value)
}

function remove() {
  colorizes.value = colorizes.value.filter(colorize => !applied.value.includes(colorize))
}
</script>

<template>
  <div
    v-if="matches.length || applied.length"
    class="editor-category-colors-notice d-flex align-items-center gap-2 p-2 rounded bg-body-secondary"
  >
    <span class="editor-category-colors-notice__message me-auto">{{ message }}</span>
    <template v-if="matches.length">
      <ButtonIcon
        class="editor-category-colors-notice__apply"
        label="Apply"
        size="sm"
        variant="primary"
        @click="apply"
      />
      <ButtonIcon
        class="editor-category-colors-notice__dismiss"
        label="Dismiss"
        :icon-left="IPhX"
        hide-label
        square
        size="sm"
        variant="link"
        @click="dismiss"
      />
    </template>
    <ButtonIcon
      v-else
      class="editor-category-colors-notice__remove"
      label="Remove"
      size="sm"
      variant="outline-secondary"
      @click="remove"
    />
  </div>
</template>
