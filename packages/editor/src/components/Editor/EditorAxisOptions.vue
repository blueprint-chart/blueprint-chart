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
import { computed, h, type Component, type FunctionalComponent } from 'vue'
import {
  FormControlButtonGroup,
  FormControlCheckbox,
  FormControlTextInput,
} from '@blueprint-chart/ui'
import type { ChartOptionDef } from '@blueprint-chart/lib'
import { useChartTypeOptions, type ChartTypeOptionKey } from '@/composables/useChartTypeOptions'
import IFluentLineSolid from '~icons/fluent/line-horizontal-1-20-filled'
import IFluentLineDashed from '~icons/fluent/line-horizontal-1-dashes-20-filled'
import IFluentLineDotted from '~icons/fluent/line-horizontal-1-dot-20-filled'
import IPhEyeSlash from '~icons/ph/eye-slash'
import IPhAlignLeft from '~icons/ph/align-left'
import IPhAlignRight from '~icons/ph/align-right'
import IPhMagicWand from '~icons/ph/magic-wand'
import IPhArrowSquareIn from '~icons/ph/arrow-square-in'
import IPhArrowSquareOut from '~icons/ph/arrow-square-out'
import IPhChartLineUp from '~icons/ph/chart-line-up'
import IPhWaveSine from '~icons/ph/wave-sine'

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

const GRID_STYLE_ICONS: Record<string, Component> = {
  solid: IFluentLineSolid,
  dashed: IFluentLineDashed,
  dotted: IFluentLineDotted,
  none: IPhEyeSlash,
}

const LABEL_POSITION_ICONS: Record<string, Component> = {
  auto: IPhMagicWand,
  inside: IPhArrowSquareIn,
  outside: IPhArrowSquareOut,
  off: IPhEyeSlash,
}

const AXIS_SIDE_ICONS: Record<string, Component> = {
  left: IPhAlignLeft,
  right: IPhAlignRight,
}

const SCALE_TYPE_ICONS: Record<string, Component> = {
  linear: IPhChartLineUp,
  log: IPhWaveSine,
}

const ICON_MAPS: Record<string, Record<string, Component>> = {
  verticalGridStyle: GRID_STYLE_ICONS,
  horizontalGridStyle: GRID_STYLE_ICONS,
  verticalLabelPosition: LABEL_POSITION_ICONS,
  horizontalLabelPosition: LABEL_POSITION_ICONS,
  verticalAxisDirection: AXIS_SIDE_ICONS,
  verticalScaleType: SCALE_TYPE_ICONS,
  horizontalScaleType: SCALE_TYPE_ICONS,
}

function renderBooleanOption(def: ChartOptionDef, value: unknown, emit: (evt: 'update', v: unknown) => void) {
  return h(FormControlCheckbox, {
    'label': def.label,
    'modelValue': (value ?? def.default ?? false) as boolean,
    'onUpdate:modelValue': (v: boolean) => emit('update', v),
  })
}

function renderSelectOption(def: ChartOptionDef, value: unknown, emit: (evt: 'update', v: unknown) => void) {
  const iconMap = ICON_MAPS[def.key]
  const options = def.choices!.map(c => ({
    value: c.value,
    text: c.text,
    ...(iconMap?.[c.value] ? { icon: iconMap[c.value] } : {}),
  }))
  return h(FormControlButtonGroup, {
    'label': def.label,
    options,
    'block': true,
    'modelValue': (value ?? def.default ?? '') as string,
    'onUpdate:modelValue': (v: string) => emit('update', v),
  })
}

function renderTextOption(def: ChartOptionDef, value: unknown, emit: (evt: 'update', v: unknown) => void) {
  return h(FormControlTextInput, {
    'label': def.label,
    'id': `opt-${def.key}`,
    'placeholder': def.placeholder ?? '',
    'modelValue': (value as string) ?? '',
    'onUpdate:modelValue': (v: string) => emit('update', v),
  })
}

const AxisOption: FunctionalComponent<{
  def: ChartOptionDef
  value: unknown
}, { update: [value: unknown] }> = (props, { emit }) => {
  const { def, value } = props

  if (def.type === 'boolean') {
    return renderBooleanOption(def, value, emit)
  }
  if (def.type === 'select' && def.choices) {
    return renderSelectOption(def, value, emit)
  }
  if (def.type === 'text') {
    return renderTextOption(def, value, emit)
  }
  return null
}

AxisOption.props = ['def', 'value']
AxisOption.emits = ['update']
</script>
