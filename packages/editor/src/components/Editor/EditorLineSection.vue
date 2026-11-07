<template>
  <div class="d-flex flex-column gap-3">
    <BFormGroup
      v-if="hasInterpolation"
      label="Line interpolation"
      label-for="opt-interpolation"
    >
      <BFormSelect
        id="opt-interpolation"
        :model-value="currentOptions.interpolation ?? 'linear'"
        :options="interpolationChoices"
        @update:model-value="(v) => setOption('interpolation', String(v ?? ''))"
      />
    </BFormGroup>

    <FormControlCheckbox
      v-if="hasEdgePadding"
      :model-value="currentOptions.edgePadding ?? false"
      label="Edge padding"
      @update:model-value="(v) => setOption('edgePadding', v)"
    />

    <FormControlCheckbox
      v-if="hasConnectGaps"
      :model-value="currentOptions.connectGaps ?? false"
      label="Connect gaps"
      @update:model-value="(v) => setOption('connectGaps', v)"
    />

    <FormControlCheckbox
      v-if="hasAreaFill"
      id="opt-area-fill"
      :model-value="currentOptions.areaFill ?? false"
      label="Area fill"
      @update:model-value="(v) => setOption('areaFill', v)"
    />

    <FormControlSliderInput
      v-if="hasAreaFillOpacity"
      id="opt-area-fill-opacity"
      :model-value="String(currentOptions.areaFillOpacity ?? '0.25')"
      label="Fill opacity"
      min="0"
      max="1"
      step="0.05"
      @update:model-value="(v) => setOption('areaFillOpacity', String(v))"
    />

    <BFormGroup
      v-if="hasAreaFillBaseline"
      label="Fill to"
      label-for="opt-area-fill-baseline"
    >
      <BFormSelect
        id="opt-area-fill-baseline"
        :model-value="currentOptions.areaFillBaseline ?? 'bottom'"
        :options="areaFillBaselineChoices"
        @update:model-value="(v) => setOption('areaFillBaseline', String(v ?? ''))"
      />
    </BFormGroup>

    <EditorLineSymbols v-if="hasLineSymbols" />
  </div>
</template>

<script setup lang="ts">
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import { FormControlCheckbox, FormControlSliderInput } from '@blueprint-chart/ui'

const { currentOptions, availableOptionKeys, setOption } = useChartTypeOptions()

const hasInterpolation = computed(() => availableOptionKeys.value.includes('interpolation'))
const hasEdgePadding = computed(() => availableOptionKeys.value.includes('edgePadding'))
const hasConnectGaps = computed(() => availableOptionKeys.value.includes('connectGaps'))
const hasAreaFill = computed(() => availableOptionKeys.value.includes('areaFill'))
const hasAreaFillOpacity = computed(() => availableOptionKeys.value.includes('areaFillOpacity'))
const hasAreaFillBaseline = computed(() => availableOptionKeys.value.includes('areaFillBaseline'))
const hasLineSymbols = computed(() => availableOptionKeys.value.includes('lineSymbols'))

const interpolationChoices = [
  { value: 'linear', text: 'Linear' },
  { value: 'monotoneX', text: 'Monotone' },
  { value: 'step', text: 'Step' },
  { value: 'stepBefore', text: 'Step (before)' },
  { value: 'stepAfter', text: 'Step (after)' },
  { value: 'basis', text: 'Basis' },
  { value: 'cardinal', text: 'Cardinal' },
  { value: 'catmullRom', text: 'Catmull-Rom' },
]

const areaFillBaselineChoices = [
  { value: 'bottom', text: 'Plot bottom' },
  { value: 'zero', text: 'Zero' },
]
</script>
