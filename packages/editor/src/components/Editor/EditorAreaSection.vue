<template>
  <div class="d-flex flex-column gap-3">
    <FormControlSliderInput
      id="opt-area-opacity"
      :model-value="String(currentOptions.areaFillOpacity ?? '0.85')"
      label="Opacity"
      min="0"
      max="1"
      step="0.05"
      @update:model-value="(v) => setOption('areaFillOpacity', v)"
    />

    <BFormGroup
      label="Interpolation"
      label-for="opt-area-interpolation"
    >
      <BFormSelect
        id="opt-area-interpolation"
        :model-value="currentOptions.interpolation ?? 'monotoneX'"
        :options="interpolationChoices"
        @update:model-value="(v) => setOption('interpolation', String(v))"
      />
    </BFormGroup>

    <BFormGroup label="Sort areas">
      <BFormRadioGroup
        :model-value="currentOptions.areaSortMode ?? 'none'"
        :options="sortAreaOptions"
        stacked
        @update:model-value="(v) => setOption('areaSortMode', String(v))"
      />
    </BFormGroup>

    <FormControlCheckbox
      :model-value="currentOptions.stacked !== false"
      label="Stack areas"
      @update:model-value="(v) => setOption('stacked', v)"
    >
      <template #section>
        <div class="bc-area-stack-options">
          <BFormCheckbox
            :model-value="currentOptions.stackPercent ?? false"
            @update:model-value="(v) => setOption('stackPercent', v as boolean)"
          >
            Stack to 100%
          </BFormCheckbox>
          <BFormCheckbox
            :model-value="currentOptions.areaLines !== false"
            @update:model-value="(v) => setOption('areaLines', v as boolean)"
          >
            Separate areas with lines
          </BFormCheckbox>
        </div>
      </template>
    </FormControlCheckbox>
  </div>
</template>

<script setup lang="ts">
import { FormControlCheckbox, FormControlSliderInput } from '@blueprint-chart/ui'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'

const { currentOptions, setOption } = useChartTypeOptions()

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

const sortAreaOptions = [
  { value: 'none', text: 'Keep order' },
  { value: 'ascending', text: 'Smallest first' },
  { value: 'descending', text: 'Largest first' },
]
</script>

<style scoped lang="scss">
.bc-area-stack-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--bs-tertiary-bg);
  border-radius: var(--bs-border-radius);
}
</style>
