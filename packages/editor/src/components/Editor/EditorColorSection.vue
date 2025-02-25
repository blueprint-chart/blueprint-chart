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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FormControlColorsInput, FormControlPalette, FormControlCheckbox } from '@blueprint-chart/ui'
import { useChartConfig } from '@/composables/useChartConfig'
import { useChartTypeOptions } from '@/composables/useChartTypeOptions'
import { parseData, listPalettes } from '@blueprint-chart/lib'
import EditorBarAppearance from './EditorBarAppearance.vue'

const { chartType, data, highlights } = useChartConfig()
const { currentOptions, availableOptionKeys, setOption } = useChartTypeOptions()

const hasHighlights = computed(() =>
  ['bar-vertical', 'bar-horizontal', 'vertical-bar', 'horizontal-bar'].includes(chartType.value),
)

const hasColors = computed(() => availableOptionKeys.value.includes('colors'))
const hasPalette = computed(() => availableOptionKeys.value.includes('colorPalette'))

const parsed = computed(() => parseData(data.value))
const dataLabels = computed(() => parsed.value.labels)

const baseColor = computed(() => {
  const colors = currentOptions.value.colors as string[] | undefined
  return colors?.[0] ?? '#4e79a7'
})

function onBaseColorChange(color: string) {
  const colors = currentOptions.value.colors as string[] | undefined
  if (colors && colors.length > 0) {
    setOption('colors', [color, ...colors.slice(1)])
  }
  else {
    setOption('colors', [color])
  }
}

const paletteOptions = [
  { value: '', label: 'Custom', colors: [] as string[] },
  ...listPalettes().map(p => ({
    value: p.name,
    label: p.label,
    colors: [...p.colors],
  })),
]

</script>
