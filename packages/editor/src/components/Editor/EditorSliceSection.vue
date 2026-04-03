<template>
  <div class="d-flex flex-column gap-3">
    <FormControlCheckbox
      v-if="has('displayAsPercentage')"
      :model-value="currentOptions.displayAsPercentage ?? false"
      label="Display as percentage"
      @update:model-value="(v) => setOption('displayAsPercentage', v)"
    />

    <FormControlCheckbox
      v-if="has('showTotal')"
      :model-value="currentOptions.showTotal ?? false"
      label="Show total"
      @update:model-value="(v) => setOption('showTotal', v)"
    />

    <FormControlCheckbox
      v-if="has('showLabels')"
      :model-value="currentOptions.showLabels ?? true"
      label="Show labels"
      @update:model-value="(v) => setOption('showLabels', v)"
    />

    <FormControlCheckbox
      v-if="has('showValues')"
      :model-value="currentOptions.showValues ?? true"
      label="Show values"
      @update:model-value="(v) => setOption('showValues', v)"
    />

    <FormControlSliderInput
      v-if="has('sliceMax')"
      id="opt-sliceMax"
      label="Max slices"
      :model-value="(currentOptions.sliceMax as string) ?? '6'"
      min="2"
      max="20"
      @update:model-value="(v) => setOption('sliceMax', String(v))"
    />

    <BFormGroup
      v-if="has('sliceGroupLabel')"
      label="Group label"
      label-for="opt-sliceGroupLabel"
    >
      <BFormInput
        id="opt-sliceGroupLabel"
        :model-value="(currentOptions.sliceGroupLabel as string) ?? 'Others'"
        placeholder="Others"
        @update:model-value="(v: string) => setOption('sliceGroupLabel', v)"
      />
    </BFormGroup>
  </div>
</template>

<script setup lang="ts">
import { useChartTypeOptions, type ChartTypeOptionKey } from '@/stores/chartTypeOptions'
import { FormControlCheckbox, FormControlSliderInput } from '@blueprint-chart/ui'

const { currentOptions, availableOptionKeys, setOption } = useChartTypeOptions()

function has(key: string) {
  return availableOptionKeys.value.includes(key as ChartTypeOptionKey)
}
</script>
