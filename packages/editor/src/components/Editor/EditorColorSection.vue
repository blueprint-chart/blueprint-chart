<template>
  <div class="d-flex flex-column gap-3">
    <EditorBarAppearance
      v-if="hasHighlights"
      :labels="dataLabels"
      :highlights="highlights"
      :base-color="baseColor"
      @update:highlights="(v) => highlights = v"
      @update:base-color="onBaseColorChange"
    />

    <template v-else>
      <FormControlPalette
        v-if="hasPalette"
        id="opt-palette"
        label="Color palette"
        :model-value="currentOptions.colorPalette ?? ''"
        :palettes="paletteOptions"
        @update:model-value="(v) => setOption('colorPalette', v)"
      />
      <FormControlColorsInput
        v-if="hasColors && !currentOptions.colorPalette"
        id="opt-colors"
        label="Colors"
        :model-value="currentOptions.colors ?? []"
        @update:model-value="(v) => setOption('colors', v)"
      />
    </template>

    <FormControlCheckbox
      v-if="hasPalette || hasColors"
      id="opt-auto-contrast"
      label="Auto-adjust contrast"
      :model-value="currentOptions.autoContrast ?? false"
      @update:model-value="(v) => setOption('autoContrast', v)"
    />

    <div
      v-if="contrastInfo"
      class="d-flex align-items-center gap-2"
    >
      <span class="form-label mb-0">Contrast</span>
      <DisplayContrastBadge :level="contrastInfo.level" />
      <span class="text-body-secondary editor-color-section__ratio">{{ contrastInfo.label }}</span>
    </div>

    <FormControlColorblindPicker
      id="opt-cvd-mode"
      v-model="cvdMode"
      label="Colorblind simulation"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FormControlColorsInput, FormControlPalette, FormControlCheckbox, DisplayContrastBadge, FormControlColorblindPicker } from '@blueprint-chart/ui'
import { useChartConfig } from '@/composables/useChartConfig'
import { useChartTypeOptions } from '@/composables/useChartTypeOptions'
import { useCvdMode } from '@/composables/useCvdMode'
import { parseData, listPalettes, resolvePalette, wcagContrastRatio, wcagLevel } from '@blueprint-chart/lib'
import EditorBarAppearance from './EditorBarAppearance.vue'

const { chartType, data, highlights } = useChartConfig()
const { currentOptions, availableOptionKeys, setOption } = useChartTypeOptions()
const { cvdMode } = useCvdMode()

const hasHighlights = computed(() =>
  ['bar-vertical', 'bar-horizontal', 'vertical-bar', 'horizontal-bar'].includes(chartType.value),
)

const hasColors = computed(() => availableOptionKeys.value.includes('colors'))
const hasPalette = computed(() => availableOptionKeys.value.includes('colorPalette'))

const parsed = computed(() => parseData(data.value))
const dataLabels = computed(() => parsed.value.labels)

const resolvedColors = computed<string[]>(() => {
  const paletteName = currentOptions.value.colorPalette as string | undefined
  if (paletteName) return resolvePalette(paletteName) ?? []
  const custom = currentOptions.value.colors as string[] | undefined
  return custom ?? []
})

const baseColor = computed(() => resolvedColors.value[0] ?? '#4e79a7')

function onBaseColorChange(color: string) {
  if (currentOptions.value.colorPalette) {
    setOption('colorPalette', '')
  }
  setOption('colors', [color])
}

const activeColors = computed<string[]>(() => {
  if (hasHighlights.value) {
    const highlightColors = highlights.value.map(h => h.color)
    const base = baseColor.value
    return highlightColors.length > 0 ? [base, ...highlightColors] : [base]
  }
  return resolvedColors.value
})

const contrastInfo = computed(() => {
  const colors = activeColors.value
  if (colors.length === 0) return null
  const bg = '#ffffff'
  const ratios = colors.map(c => wcagContrastRatio(c, bg))
  const minRatio = Math.min(...ratios)
  const level = wcagLevel(minRatio)
  const label = `${minRatio.toFixed(1)}:1${colors.length > 1 ? ' (lowest)' : ''}`
  return { level, label }
})

const paletteOptions = [
  { value: '', label: 'Custom', colors: [] as string[] },
  ...listPalettes().map(p => ({
    value: p.name,
    label: p.label,
    colors: [...p.colors],
  })),
]
</script>

<style scoped lang="scss">
.editor-color-section__ratio {
  font-size: 0.75rem;
}
</style>
