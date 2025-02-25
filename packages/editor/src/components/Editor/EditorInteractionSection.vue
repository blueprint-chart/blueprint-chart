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

const { currentOptions, availableOptionKeys, setOption } = useChartTypeOptions()

const hasValueLabels = computed(() => availableOptionKeys.value.includes('valueLabels'))
const hasTooltips = computed(() => availableOptionKeys.value.includes('tooltips'))
const hasCrosshair = computed(() => availableOptionKeys.value.includes('crosshair'))

const valueLabelPositionChoices = [
  { value: 'auto', text: 'Auto' },
  { value: 'outside', text: 'Outside' },
  { value: 'inside', text: 'Inside' },
]

const crosshairDirectionChoices = [
  { value: 'both', text: 'Both' },
  { value: 'vertical', text: 'Vertical' },
  { value: 'horizontal', text: 'Horizontal' },
]
const crosshairStyleChoices = [
  { value: 'solid', text: 'Solid' },
  { value: 'dashed', text: 'Dashed' },
  { value: 'dotted', text: 'Dotted' },
]
</script>
