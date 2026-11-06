<script setup lang="ts">
import { FormControlCheckbox } from '@blueprint-chart/ui'
import { detectRangeColumn, MAPPING_NONE, numericColumns, parseData } from '@blueprint-chart/lib'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'

type RangeRole = 'low' | 'high'

const ROLE_LABELS: Record<RangeRole, string> = { low: 'Low column', high: 'High column' }

const { data } = useChartConfig()
const { currentOptions, setOption } = useChartTypeOptions()

const columns = computed(() => numericColumns(parseData(data.value)))
const detectedLow = computed(() => detectRangeColumn(columns.value, 'low'))
const effectiveLow = computed(() => {
  const low = currentOptions.value.low
  return low === MAPPING_NONE ? undefined : low || detectedLow.value
})
const detectedHigh = computed(() => detectRangeColumn(columns.value.filter(name => name !== effectiveLow.value), 'high'))
const fields = computed(() => [
  buildField('low', detectedLow.value),
  buildField('high', detectedHigh.value),
])

function buildOptions(role: RangeRole, detected?: string) {
  const excluded = role === 'high' ? effectiveLow.value : undefined
  const columnOptions = columns.value.filter(name => name !== detected && name !== excluded).map(name => ({ value: name, text: name }))
  return [{ value: '', text: `${detected ?? 'None'} (auto)` }, ...columnOptions, { value: MAPPING_NONE, text: 'None' }]
}

function buildField(role: RangeRole, detected?: string) {
  const value = currentOptions.value[role] ?? ''
  return { role, label: ROLE_LABELS[role], value: value === detected ? '' : value, options: buildOptions(role, detected) }
}
</script>

<template>
  <div class="editor-dot-plot-settings d-flex flex-column gap-3">
    <BFormGroup
      v-for="field in fields"
      :key="field.role"
      class="editor-dot-plot-settings__field"
      :label="field.label"
      :label-for="`dot-plot-${field.role}`"
    >
      <BFormSelect
        :id="`dot-plot-${field.role}`"
        :model-value="field.value"
        :options="field.options"
        @update:model-value="(value) => setOption(field.role, String(value ?? ''))"
      />
    </BFormGroup>

    <FormControlCheckbox
      class="editor-dot-plot-settings__arrows"
      :model-value="currentOptions.arrows ?? false"
      label="Arrows"
      @update:model-value="(value) => setOption('arrows', value)"
    />
  </div>
</template>
