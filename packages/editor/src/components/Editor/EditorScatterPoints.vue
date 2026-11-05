<script setup lang="ts">
import { FormControlCheckbox } from '@blueprint-chart/ui'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'

const TREND_OPTIONS = [
  { value: '', text: 'Off' },
  { value: 'overall', text: 'Overall' },
  { value: 'per-group', text: 'Per group' },
]

const { currentOptions, setOption } = useChartTypeOptions()
</script>

<template>
  <div class="editor-scatter-points d-flex flex-column gap-3">
    <BFormGroup
      class="editor-scatter-points__trend"
      label="Trend line"
      label-for="scatter-trend"
    >
      <BFormSelect
        id="scatter-trend"
        :model-value="currentOptions.trend ?? ''"
        :options="TREND_OPTIONS"
        @update:model-value="(value) => setOption('trend', String(value ?? ''))"
      />
    </BFormGroup>

    <FormControlCheckbox
      class="editor-scatter-points__labels"
      :model-value="currentOptions.showLabels ?? false"
      label="Label all points"
      @update:model-value="(value) => setOption('showLabels', value)"
    />
  </div>
</template>
