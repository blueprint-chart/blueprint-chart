<template>
  <div class="d-flex flex-column gap-3">
    <FormControlCheckbox
      v-if="hasTooltips"
      :model-value="currentOptions.tooltips ?? false"
      label="Tooltips"
      @update:model-value="(v) => setOption('tooltips', v)"
    />

    <FormControlCheckbox
      v-if="hasCrosshair"
      :model-value="currentOptions.crosshair ?? false"
      label="Crosshair"
      @update:model-value="(v) => setOption('crosshair', v)"
    />

    <template v-if="hasCrosshair && currentOptions.crosshair">
      <FormControlButtonGroup
        label="Direction"
        :model-value="currentOptions.crosshairDirection ?? 'both'"
        :options="crosshairDirectionChoices"
        block
        @update:model-value="(v) => setOption('crosshairDirection', v)"
      />

      <FormControlButtonGroup
        label="Line style"
        :model-value="currentOptions.crosshairStyle ?? 'dashed'"
        :options="crosshairStyleChoices"
        block
        @update:model-value="(v) => setOption('crosshairStyle', v)"
      />

      <FormControlColorInput
        id="opt-crosshair-color"
        label="Color"
        :model-value="currentOptions.crosshairColor ?? '#999999'"
        @update:model-value="(v) => setOption('crosshairColor', v)"
      />
    </template>

    <template v-if="hasScenes">
      <FormControlDropdown
        id="layout-player-type"
        v-model="playerType"
        label="Scene player"
        :options="playerTypeOptions"
        block
      />

      <FormControlButtonGroup
        v-if="playerType === 'dot-stepper' || playerType === 'minimal-arrows'"
        v-model="playerPosition"
        label="Player position"
        :options="playerPositionOptions"
        block
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChartTypeOptions } from '@/composables/useChartTypeOptions'
import { useChartConfig } from '@/composables/useChartConfig'
import { useScenes } from '@/composables/useScenes'
import { FormControlCheckbox, FormControlColorInput, FormControlButtonGroup, FormControlDropdown } from '@blueprint-chart/ui'
import IPhArrowsOutCardinal from '~icons/ph/arrows-out-cardinal'
import IPhArrowsVertical from '~icons/ph/arrows-vertical'
import IPhArrowsHorizontal from '~icons/ph/arrows-horizontal'
import IFluentLineSolid from '~icons/fluent/line-horizontal-1-20-filled'
import IFluentLineDashed from '~icons/fluent/line-horizontal-1-dashes-20-filled'
import IFluentLineDotted from '~icons/fluent/line-horizontal-1-dot-20-filled'

const { currentOptions, availableOptionKeys, setOption } = useChartTypeOptions()
const { layout } = useChartConfig()
const { scenes } = useScenes()

const hasTooltips = computed(() => availableOptionKeys.value.includes('tooltips'))
const hasCrosshair = computed(() => availableOptionKeys.value.includes('crosshair'))
const hasScenes = computed(() => scenes.value.length >= 1)

const crosshairDirectionChoices = [
  { value: 'both', text: 'Both', icon: IPhArrowsOutCardinal },
  { value: 'vertical', text: 'Vertical', icon: IPhArrowsVertical },
  { value: 'horizontal', text: 'Horizontal', icon: IPhArrowsHorizontal },
]
const crosshairStyleChoices = [
  { value: 'solid', text: 'Solid', icon: IFluentLineSolid },
  { value: 'dashed', text: 'Dashed', icon: IFluentLineDashed },
  { value: 'dotted', text: 'Dotted', icon: IFluentLineDotted },
]

const playerType = computed({
  get: () => layout.value.playerType,
  set: (v) => { layout.value.playerType = v },
})

const playerPosition = computed({
  get: () => layout.value.playerPosition,
  set: (v) => { layout.value.playerPosition = v },
})

const playerTypeOptions = [
  { value: 'progress-bar', label: 'Progress Bar' },
  { value: 'dot-stepper', label: 'Dot Stepper' },
  { value: 'minimal-arrows', label: 'Minimal Arrows' },
  { value: 'none', label: 'None' },
]

const playerPositionOptions = [
  { value: 'left', text: 'Left' },
  { value: 'center', text: 'Center' },
  { value: 'right', text: 'Right' },
]
</script>
