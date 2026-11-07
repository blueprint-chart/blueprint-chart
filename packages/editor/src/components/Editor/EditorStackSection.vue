<template>
  <div class="d-flex flex-column gap-3">
    <BFormGroup
      label="Stack mode"
      label-for="opt-stack-mode"
    >
      <BFormSelect
        id="opt-stack-mode"
        :model-value="currentOptions.stackMode ?? 'normal'"
        :options="stackModeChoices"
        @update:model-value="(v) => setOption('stackMode', String(v ?? ''))"
      />
    </BFormGroup>

    <FormControlCheckbox
      v-if="availableOptionKeys.includes('showTotal') && currentOptions.stackMode !== 'percent'"
      :model-value="currentOptions.showTotal ?? false"
      label="Show total"
      @update:model-value="(v) => setOption('showTotal', v)"
    />
  </div>
</template>

<script setup lang="ts">
import { useChartTypeOptions } from '@/stores/chartTypeOptions'
import { FormControlCheckbox } from '@blueprint-chart/ui'

const { currentOptions, availableOptionKeys, setOption } = useChartTypeOptions()

const stackModeChoices = [
  { value: 'normal', text: 'Normal' },
  { value: 'percent', text: 'Percentage (100%)' },
]
</script>
