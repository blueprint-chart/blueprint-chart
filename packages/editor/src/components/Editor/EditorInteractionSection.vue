<template>
  <div class="d-flex flex-column gap-3">
    <FormControlCheckbox
      v-if="hasValueLabels"
      :model-value="currentOptions.valueLabels ?? false"
      label="Value labels"
      @update:model-value="(v) => setOption('valueLabels', v)"
    />

    <FormControlButtonGroup
      v-if="hasValueLabels && currentOptions.valueLabels"
      label="Label position"
      :model-value="currentOptions.valueLabelPosition ?? 'auto'"
      :options="valueLabelPositionChoices"
      block
      @update:model-value="(v) => setOption('valueLabelPosition', v)"
    />

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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChartTypeOptions } from '@/composables/useChartTypeOptions'
import { FormControlCheckbox, FormControlColorInput, FormControlButtonGroup } from '@blueprint-chart/ui'
import IPhMagicWand from '~icons/ph/magic-wand'
import IPhArrowSquareOut from '~icons/ph/arrow-square-out'
import IPhArrowSquareIn from '~icons/ph/arrow-square-in'
import IPhArrowsOutCardinal from '~icons/ph/arrows-out-cardinal'
import IPhArrowsVertical from '~icons/ph/arrows-vertical'
import IPhArrowsHorizontal from '~icons/ph/arrows-horizontal'
import IFluentLineSolid from '~icons/fluent/line-horizontal-1-20-filled'
import IFluentLineDashed from '~icons/fluent/line-horizontal-1-dashes-20-filled'
import IFluentLineDotted from '~icons/fluent/line-horizontal-1-dot-20-filled'

const { currentOptions, availableOptionKeys, setOption } = useChartTypeOptions()

const hasValueLabels = computed(() => availableOptionKeys.value.includes('valueLabels'))
const hasTooltips = computed(() => availableOptionKeys.value.includes('tooltips'))
const hasCrosshair = computed(() => availableOptionKeys.value.includes('crosshair'))

const valueLabelPositionChoices = [
  { value: 'auto', text: 'Auto', icon: IPhMagicWand },
  { value: 'outside', text: 'Outside', icon: IPhArrowSquareOut },
  { value: 'inside', text: 'Inside', icon: IPhArrowSquareIn },
]

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
</script>
