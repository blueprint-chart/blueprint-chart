<template>
  <div class="d-flex flex-column gap-3">
    <FormControlCheckbox
      v-if="has('displayAsPercentage')"
      :model-value="currentOptions.displayAsPercentage ?? false"
      label="Display as percentage"
      @update:model-value="(v) => setOption('displayAsPercentage', v)"
    />

    <FormControlNumberFormat
      v-if="has('verticalNumberFormat')"
      id="opt-verticalNumberFormat"
      label="Number format"
      :model-value="(currentOptions.verticalNumberFormat as string) ?? ''"
      @update:model-value="(v) => setOption('verticalNumberFormat', v)"
    />

    <FormControlCheckbox
      v-if="has('showTotal')"
      :model-value="currentOptions.showTotal ?? false"
      label="Show total"
      @update:model-value="(v) => setOption('showTotal', v)"
    />

    <template v-if="showCenterControls">
      <BFormGroup
        label="Center label"
        label-for="opt-centerLabel"
      >
        <BFormSelect
          id="opt-centerLabel"
          :model-value="centerLabel"
          :options="centerLabelChoices"
          @update:model-value="(v) => setOption('centerLabel', String(v))"
        />
      </BFormGroup>

      <BFormGroup
        v-if="centerLabel === 'total'"
        label="Total label"
        label-for="opt-totalLabel"
      >
        <BFormInput
          id="opt-totalLabel"
          :model-value="(currentOptions.totalLabel as string) ?? 'Total'"
          placeholder="Total"
          @update:model-value="(v) => setOption('totalLabel', String(v ?? ''))"
        />
      </BFormGroup>

      <BFormGroup
        v-if="centerLabel === 'slice'"
        label="Center slice"
        label-for="opt-centerSlice"
      >
        <BFormInput
          id="opt-centerSlice"
          :model-value="(currentOptions.centerSlice as string) ?? ''"
          @update:model-value="(v) => setOption('centerSlice', String(v ?? ''))"
        />
      </BFormGroup>

      <BFormGroup
        v-if="centerLabel === 'custom'"
        label="Center text"
        label-for="opt-centerText"
      >
        <BFormInput
          id="opt-centerText"
          :model-value="(currentOptions.centerText as string) ?? ''"
          @update:model-value="(v) => setOption('centerText', String(v ?? ''))"
        />
      </BFormGroup>
    </template>

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
        @update:model-value="(v) => setOption('sliceGroupLabel', String(v ?? ''))"
      />
    </BFormGroup>
  </div>
</template>

<script setup lang="ts">
import { useChartTypeOptions, type ChartTypeOptionKey } from '@/stores/chartTypeOptions'
import { FormControlCheckbox, FormControlNumberFormat, FormControlSliderInput } from '@blueprint-chart/ui'

const { currentOptions, optionDefs, availableOptionKeys, setOption } = useChartTypeOptions()

const centerLabelChoices = computed(() => optionDefs.value.find(d => d.key === 'centerLabel')?.choices ?? [])
const centerLabel = computed(() => (currentOptions.value.centerLabel as string) || 'total')
const showCenterControls = computed(() => has('centerLabel') && !!currentOptions.value.showTotal)

function has(key: string) {
  return availableOptionKeys.value.includes(key as ChartTypeOptionKey)
}
</script>
