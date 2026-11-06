<script setup lang="ts">
import { FormControlButtonGroup, FormControlButtonGroupEntry } from '@blueprint-chart/ui'
import { ArrowDirection, detectRangeColumn, DotStyle, numericColumns, parseData } from '@blueprint-chart/lib'
import IPhArrowLeft from '~icons/ph/arrow-left'
import IPhArrowRight from '~icons/ph/arrow-right'
import IPhArrowsLeftRight from '~icons/ph/arrows-left-right'
import IPhMinus from '~icons/ph/minus'
import { useChartConfig } from '@/stores/chartConfig'
import { useChartTypeOptions } from '@/stores/chartTypeOptions'

type RangeRole = 'low' | 'high'

const ROLE_LABELS: Record<RangeRole, string> = { low: 'Low column', high: 'High column' }

const ARROW_ENTRIES = [
  { value: ArrowDirection.None, text: 'None', icon: IPhMinus },
  { value: ArrowDirection.Forward, text: 'Forward', icon: IPhArrowRight },
  { value: ArrowDirection.Backward, text: 'Backward', icon: IPhArrowLeft },
  { value: ArrowDirection.Both, text: 'Both', icon: IPhArrowsLeftRight },
]

const { data } = useChartConfig()
const { currentOptions, setOption } = useChartTypeOptions()

const dotStyle = computed(() => currentOptions.value.dotStyle ?? DotStyle.Dumbbell)
const isRange = computed(() => dotStyle.value === DotStyle.Range)
const columns = computed(() => numericColumns(parseData(data.value)))
const detectedLow = computed(() => detectRangeColumn(columns.value, 'low'))
const effectiveLow = computed(() => currentOptions.value.low || detectedLow.value)
const detectedHigh = computed(() => detectRangeColumn(columns.value.filter(name => name !== effectiveLow.value), 'high'))
const fields = computed(() => [
  buildField('low', detectedLow.value),
  buildField('high', detectedHigh.value),
])

function buildOptions(role: RangeRole, detected?: string) {
  const excluded = role === 'high' ? effectiveLow.value : undefined
  const columnOptions = columns.value.filter(name => name !== detected && name !== excluded).map(name => ({ value: name, text: name }))
  return [{ value: '', text: `${detected ?? 'None'} (auto)` }, ...columnOptions]
}

function buildField(role: RangeRole, detected?: string) {
  const value = currentOptions.value[role] ?? ''
  return { role, label: ROLE_LABELS[role], value: value === detected ? '' : value, options: buildOptions(role, detected) }
}
</script>

<template>
  <div class="editor-dot-plot-settings d-flex flex-column gap-3">
    <FormControlButtonGroup
      class="editor-dot-plot-settings__style"
      :model-value="dotStyle"
      label="Style"
      block
      @update:model-value="(value: string) => setOption('dotStyle', value as DotStyle)"
    >
      <FormControlButtonGroupEntry
        :value="DotStyle.Dumbbell"
        text="Dumbbell"
      />
      <FormControlButtonGroupEntry
        :value="DotStyle.Range"
        text="Range"
      />
    </FormControlButtonGroup>

    <template v-if="isRange">
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
    </template>

    <FormControlButtonGroup
      v-else
      class="editor-dot-plot-settings__arrows"
      :model-value="currentOptions.arrows ?? ArrowDirection.None"
      label="Arrows"
      block
      @update:model-value="(value: string) => setOption('arrows', value as ArrowDirection)"
    >
      <FormControlButtonGroupEntry
        v-for="entry in ARROW_ENTRIES"
        :key="entry.value"
        :value="entry.value"
        :text="entry.text"
        :icon-left="entry.icon"
      />
    </FormControlButtonGroup>
  </div>
</template>
