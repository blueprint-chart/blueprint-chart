<template>
  <div
    v-if="verticalDefs.length > 0 || horizontalDefs.length > 0"
    class="d-flex flex-column gap-4"
  >
    <div v-if="verticalDefs.length > 0">
      <h6 class="fw-bold mb-3">
        Vertical Axis
      </h6>
      <div class="d-flex flex-column gap-2">
        <template
          v-for="def in verticalDefs"
          :key="def.key"
        >
          <AxisOption
            :def="def"
            :value="currentOptions[def.key as ChartTypeOptionKey]"
            @update="(v) => setOption(def.key as ChartTypeOptionKey, v as any)"
          />
        </template>
      </div>
    </div>

    <hr v-if="verticalDefs.length > 0 && horizontalDefs.length > 0">

    <div v-if="horizontalDefs.length > 0">
      <h6 class="fw-bold mb-3">
        Horizontal Axis
      </h6>
      <div class="d-flex flex-column gap-2">
        <template
          v-for="def in horizontalDefs"
          :key="def.key"
        >
          <AxisOption
            :def="def"
            :value="currentOptions[def.key as ChartTypeOptionKey]"
            @update="(v) => setOption(def.key as ChartTypeOptionKey, v as any)"
          />
        </template>
      </div>
    </div>
  </div>
  <p
    v-else
    class="text-muted small"
  >
    No axis options for this chart type.
  </p>
</template>

<script setup lang="ts">
import { computed, h, type FunctionalComponent } from 'vue'
import {
  FormControlButtonGroup,
  FormControlCheckbox,
  FormControlTextInput,
} from '@blueprint-chart/ui'
import type { ChartOptionDef } from '@blueprint-chart/lib'
import { useChartTypeOptions, type ChartTypeOptionKey } from '@/composables/useChartTypeOptions'

const VERTICAL_KEYS = new Set([
  'showVerticalAxis',
  'verticalAxisDirection',
  'showVerticalTicks',
  'verticalLabelPosition',
  'verticalGridStyle',
  'verticalNumberFormat',
  'verticalScaleType',
  'verticalRangeMin',
  'verticalRangeMax',
])

const HORIZONTAL_KEYS = new Set([
  'showHorizontalAxis',
  'showHorizontalTicks',
  'horizontalLabelPosition',
  'horizontalGridStyle',
  'horizontalNumberFormat',
  'horizontalScaleType',
  'horizontalRangeMin',
  'horizontalRangeMax',
])

const { currentOptions, optionDefs, setOption } = useChartTypeOptions()

const verticalDefs = computed(() =>
  optionDefs.value.filter(d => VERTICAL_KEYS.has(d.key)),
)

const horizontalDefs = computed(() =>
  optionDefs.value.filter(d => HORIZONTAL_KEYS.has(d.key)),
)

const AxisOption: FunctionalComponent<{
  def: ChartOptionDef
  value: unknown
}, { update: [value: unknown] }> = (props, { emit }) => {
  const { def, value } = props

  if (def.type === 'boolean') {
    return h(FormControlCheckbox, {
      'label': def.label,
      'modelValue': (value ?? def.default ?? false) as boolean,
      'onUpdate:modelValue': (v: boolean) => emit('update', v),
    })
  }

  if (def.type === 'select' && def.choices) {
    const options = def.choices.map(c => ({ value: c.value, text: c.text }))
    return h(FormControlButtonGroup, {
      'label': def.label,
      options,
      'block': true,
      'modelValue': (value ?? def.default ?? '') as string,
      'onUpdate:modelValue': (v: string) => emit('update', v),
    })
  }

  if (def.type === 'text') {
    return h(FormControlTextInput, {
      'label': def.label,
      'id': `opt-${def.key}`,
      'placeholder': def.placeholder ?? '',
      'modelValue': (value as string) ?? '',
      'onUpdate:modelValue': (v: string) => emit('update', v),
    })
  }

  return null
}

AxisOption.props = ['def', 'value']
AxisOption.emits = ['update']
</script>
