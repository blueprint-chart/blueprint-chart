<script setup lang="ts">
import { MAPPING_NONE, numericColumns, parseData, resolveScatterMapping, type ScatterMapping } from '@blueprint-chart/lib'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'

type ScatterRole = keyof ScatterMapping

const ROLE_LABELS: Record<ScatterRole, string> = {
  x: 'X axis',
  y: 'Y axis',
  size: 'Bubble size',
  group: 'Color groups',
}
const ROLES = Object.keys(ROLE_LABELS) as ScatterRole[]
const OPTIONAL_ROLES: ScatterRole[] = ['size', 'group']

const { data } = useChartConfig()
const { currentOptions, setOption } = useChartTypeOptions()

const chartData = computed(() => parseData(data.value))
const fields = computed(() => ROLES.map(buildField))

function inferredColumn(role: ScatterRole) {
  return resolveScatterMapping(chartData.value, { ...currentOptions.value, [role]: '' })[role]
}

function columnsFor(role: ScatterRole) {
  return role === 'group'
    ? (chartData.value.textColumns ?? []).map(column => column.name)
    : numericColumns(chartData.value)
}

// The inferred column only appears as the auto entry, so choosing it stores '' and the DSL stays free of redundant mappings.
function buildOptions(role: ScatterRole, inferred?: string) {
  const autoOption = { value: '', text: `${inferred ?? 'None'} (auto)` }
  const columnOptions = columnsFor(role).filter(name => name !== inferred).map(name => ({ value: name, text: name }))
  const noneOptions = OPTIONAL_ROLES.includes(role) ? [{ value: MAPPING_NONE, text: 'None' }] : []
  return [autoOption, ...columnOptions, ...noneOptions]
}

function selectedValue(role: ScatterRole, inferred?: string) {
  const value = currentOptions.value[role] ?? ''
  return value === inferred ? '' : value
}

function buildField(role: ScatterRole) {
  const inferred = inferredColumn(role)
  return { role, label: ROLE_LABELS[role], value: selectedValue(role, inferred), options: buildOptions(role, inferred) }
}
</script>

<template>
  <div class="editor-scatter-columns d-flex flex-column gap-3">
    <BFormGroup
      v-for="field in fields"
      :key="field.role"
      class="editor-scatter-columns__field"
      :label="field.label"
      :label-for="`scatter-${field.role}`"
    >
      <BFormSelect
        :id="`scatter-${field.role}`"
        :model-value="field.value"
        :options="field.options"
        @update:model-value="(value) => setOption(field.role, String(value ?? ''))"
      />
    </BFormGroup>
  </div>
</template>
