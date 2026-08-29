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

    <EditorLineSymbols v-if="hasLineSymbols" />
  </div>
</template>

<script setup lang="ts">
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import { FormControlCheckbox } from '@blueprint-chart/ui'

const { currentOptions, availableOptionKeys, setOption } = useChartTypeOptions()

const hasInterpolation = computed(() => availableOptionKeys.value.includes('interpolation'))
const hasEdgePadding = computed(() => availableOptionKeys.value.includes('edgePadding'))
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
</script>
