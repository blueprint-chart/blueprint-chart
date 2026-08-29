<template>
  <div class="d-flex flex-column gap-3">
    <EditorBarAppearance
      v-if="hasColorizes"
      :labels="dataLabels"
      :colorizes="colorizes"
      :base-color="baseColor"
      @update:colorizes="(v) => colorizes = v"
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
      id="opt-allow-dark-mode"
      label="Allow dark mode"
      :model-value="currentOptions.allowDarkMode ?? true"
      @update:model-value="(v) => setOption('allowDarkMode', v)"
    />

    <FormControlCheckbox
      v-if="hasPalette || hasColors"
      id="opt-auto-contrast"
      label="Auto-adjust contrast"
      :model-value="currentOptions.autoContrast ?? false"
      @update:model-value="(v) => setOption('autoContrast', v)"
    />

    <div
      v-if="lightContrastInfo"
      class="d-flex align-items-center gap-2"
    >
      <span class="form-label mb-0">Light contrast</span>
      <DisplayContrastBadge
        :level="lightContrastInfo.level"
        :ratio="lightContrastInfo.ratio"
      />
    </div>

    <div
      v-if="darkContrastInfo"
      class="d-flex align-items-center gap-2"
    >
      <span class="form-label mb-0">Dark contrast</span>
      <DisplayContrastBadge
        :level="darkContrastInfo.level"
        :ratio="darkContrastInfo.ratio"
      />
    </div>

    <div
      v-if="cvdInfo"
      class="d-flex align-items-center gap-2"
    >
      <span class="form-label mb-0">Colorblind</span>
      <span
        v-if="cvdInfo.safe"
        ref="cvdSafeBadgeRef"
        class="editor-color-section__cvd-badge editor-color-section__cvd-badge--safe"
      >
        <IconPhCheck />
        Safe
        <IconPhInfo class="editor-color-section__cvd-badge__info" />
        <BTooltip
          teleport-to="body"
          :target="cvdSafeBadgeRef"
          title="All colors remain distinguishable under protanopia, deuteranopia, and tritanopia simulations."
          placement="top"
        />
      </span>
      <template v-else>
        <span
          v-for="issue in cvdInfo.issues"
          :key="issue.type"
          ref="cvdBadgeRefs"
          class="editor-color-section__cvd-badge editor-color-section__cvd-badge--warn"
        >
          <IconPhEye />
          {{ issue.shortLabel }}
          <IconPhInfo class="editor-color-section__cvd-badge__info" />
          <BTooltip
            teleport-to="body"
            :target="() => getCvdBadgeEl(issue.type)"
            :title="issue.tooltip"
            placement="top"
          />
        </span>
      </template>
    </div>

    <FormControlButtonGroup
      v-model="cvdMode"
      label="Colorblind simulation"
      :options="cvdOptions"
      block
    />
  </div>
</template>

<script setup lang="ts">
import { BTooltip } from 'bootstrap-vue-next'
import { FormControlColorsInput, FormControlPalette, FormControlCheckbox, DisplayContrastBadge, FormControlButtonGroup } from '@blueprint-chart/ui'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import { useCvdMode } from '@/stores/cvdMode'
import { ChartType, parseData, listPalettes, resolvePalette } from '@blueprint-chart/lib'
import type { CvdType } from '@blueprint-chart/lib'
import IconPhCheck from '~icons/ph/check'
import IconPhEye from '~icons/ph/eye'
import IconPhInfo from '~icons/ph/info'
import { useColorAccessibility } from './useColorAccessibility'
import CvdNoneThumb from '@/assets/chart-thumbnails/cvd-none.bpc'
import CvdProtanopiaThumb from '@/assets/chart-thumbnails/cvd-protanopia.bpc'
import CvdDeuteranopiaThumb from '@/assets/chart-thumbnails/cvd-deuteranopia.bpc'
import CvdTritanopiaThumb from '@/assets/chart-thumbnails/cvd-tritanopia.bpc'

const { chartType, data, colorizes } = useChartConfig()
const { currentOptions, availableOptionKeys, setOption } = useChartTypeOptions()
const { cvdMode } = useCvdMode()

const hasColorizes = computed(() =>
  ([ChartType.BarVertical, ChartType.BarHorizontal, ChartType.VerticalBar, ChartType.HorizontalBar] as string[]).includes(chartType.value),
)

const hasColors = computed(() => availableOptionKeys.value.includes('colors'))
const hasPalette = computed(() => availableOptionKeys.value.includes('colorPalette'))

const parsed = computed(() => parseData(data.value))
const dataLabels = computed(() => parsed.value.labels)

const resolvedColors = computed<string[]>(() => {
  const paletteName = currentOptions.value.colorPalette as string | undefined
  if (paletteName) {
    return resolvePalette(paletteName) ?? []
  }
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
  if (hasColorizes.value) {
    const highlightColors = colorizes.value.map(h => h.color)
    const base = baseColor.value
    return highlightColors.length > 0 ? [base, ...highlightColors] : [base]
  }
  return resolvedColors.value
})

const { lightContrastInfo, darkContrastInfo, cvdInfo } = useColorAccessibility(
  activeColors,
  () => !!currentOptions.value.autoContrast,
  () => currentOptions.value.allowDarkMode ?? true,
)

const cvdSafeBadgeRef = useTemplateRef<HTMLElement>('cvdSafeBadgeRef')
const cvdBadgeRefs = useTemplateRef<HTMLElement[]>('cvdBadgeRefs')

function getCvdBadgeEl(type: CvdType): HTMLElement | null {
  const idx = cvdInfo.value?.issues.findIndex(i => i.type === type) ?? -1
  return cvdBadgeRefs.value?.[idx] ?? null
}

const cvdOptions = [
  { value: '', text: 'None', description: 'Normal color vision', visual: markRaw(CvdNoneThumb) },
  { value: 'protanopia', text: 'Protanopia', description: 'No red cones (1% of males)', visual: markRaw(CvdProtanopiaThumb) },
  { value: 'deuteranopia', text: 'Deuteranopia', description: 'No green cones (1% of males)', visual: markRaw(CvdDeuteranopiaThumb) },
  { value: 'tritanopia', text: 'Tritanopia', description: 'No blue cones (very rare)', visual: markRaw(CvdTritanopiaThumb) },
]

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
.editor-color-section__qualifier {
  font-size: var(--bs-font-size-xs);
  font-style: italic;
}

.editor-color-section__cvd-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2em;
  padding: 0.15em 0.45em;
  font-size: var(--bs-font-size-xs);
  font-weight: 600;
  line-height: 1;
  border-radius: var(--bs-border-radius-sm);
  cursor: default;

  &--safe {
    background-color: var(--bs-success-bg-subtle);
    color: var(--bs-success-text-emphasis);
  }

  &--warn {
    background-color: var(--bs-warning-bg-subtle);
    color: var(--bs-warning-text-emphasis);
  }

  &__info {
    font-size: var(--bs-font-size-sm);
    opacity: 0.7;
  }
}
</style>
