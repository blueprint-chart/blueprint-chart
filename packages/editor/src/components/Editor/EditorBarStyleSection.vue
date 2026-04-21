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
      v-if="hasConnectedColumns"
      :model-value="currentOptions.connectedColumns ?? false"
      label="Connected columns"
      @update:model-value="(v) => setOption('connectedColumns', v)"
    />

    <FormControlSliderInput
      v-if="hasConnectedColumns && currentOptions.connectedColumns"
      id="opt-connections-opacity"
      :model-value="opacityAsPercent"
      label="Opacity"
      min="0"
      max="100"
      step="1"
      suffix="%"
      @update:model-value="onOpacityPercentChange"
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
import { FormControlCheckbox, FormControlSliderInput } from '@blueprint-chart/ui'

const { currentOptions, availableOptionKeys, setOption } = useChartTypeOptions()

const hasBarBackground = computed(() => availableOptionKeys.value.includes('barBackground'))
const hasBarSeparators = computed(() => availableOptionKeys.value.includes('barSeparators'))
const hasConnectedColumns = computed(() => availableOptionKeys.value.includes('connectedColumns'))
const hasWaterfall = computed(() => availableOptionKeys.value.includes('waterfall'))
const hasWaterfallTotal = computed(() => availableOptionKeys.value.includes('waterfallTotal'))
const hasCategoryLabelLine = computed(() => availableOptionKeys.value.includes('categoryLabelLine'))

// Opacity is stored in `connectionsOpacity` as a 0–1 decimal string (e.g. "0.15")
// but the slider displays 0–100 with a "%" suffix. These helpers translate between
// the two representations so the underlying data contract stays stable.
const DEFAULT_OPACITY_DECIMAL = 0.15

function decimalToPercent(decimal: string | undefined): string {
  const parsed = parseFloat(decimal ?? '')
  const safeValue = isNaN(parsed) ? DEFAULT_OPACITY_DECIMAL : parsed
  const clamped = Math.max(0, Math.min(1, safeValue))
  return String(Math.round(clamped * 100))
}

function percentToDecimal(percent: string): string {
  const parsed = parseFloat(percent)
  if (isNaN(parsed)) {
    return String(DEFAULT_OPACITY_DECIMAL)
  }
  const clamped = Math.max(0, Math.min(100, parsed))
  return String(clamped / 100)
}

const opacityAsPercent = computed(() => decimalToPercent(currentOptions.value.connectionsOpacity))

function onOpacityPercentChange(percent: string): void {
  setOption('connectionsOpacity', percentToDecimal(percent))
}
</script>
