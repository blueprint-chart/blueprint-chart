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
        @update:model-value="(v) => setOption('stackMode', v)"
      />
    </BFormGroup>
  </div>
</template>

<script setup lang="ts">
import { useChartTypeOptions } from '@/stores/chartTypeOptions'

const { currentOptions, setOption } = useChartTypeOptions()

const stackModeChoices = [
  { value: 'normal', text: 'Normal' },
  { value: 'percent', text: 'Percentage (100%)' },
]
</script>
