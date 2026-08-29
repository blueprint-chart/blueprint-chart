<template>
  <div
    v-if="hasValueLabels || verticalDefs.length > 0 || horizontalDefs.length > 0"
    class="d-flex flex-column gap-4"
  >
    <SettingsSection
      v-if="hasValueLabels"
      title="Value Labels"
      :icon="IPhTextAa"
    >
      <div class="d-flex flex-column gap-2">
        <FormControlCheckbox
          :model-value="Boolean(currentOptions.valueLabels ?? false)"
          label="Show value labels"
          @update:model-value="(v) => setOption('valueLabels', v)"
        />
        <FormControlButtonGroup
          v-if="currentOptions.valueLabels"
          label="Position"
          :model-value="currentOptions.valueLabelPosition ?? 'auto'"
          :options="valueLabelPositionChoices"
          block
          @update:model-value="(v) => setOption('valueLabelPosition', v)"
        />
        <FormControlCheckbox
          v-if="currentOptions.valueLabels && hasSwapLabelValue"
          :model-value="currentOptions.swapLabelValue ?? false"
          label="Swap labels and values"
          @update:model-value="(v) => setOption('swapLabelValue', v)"
        />
      </div>
    </SettingsSection>

    <SettingsSection
      v-if="verticalDefs.length > 0"
      title="Vertical Axis"
      :icon="IPhArrowsVertical"
    >
      <AxisGroup
        :defs="verticalDefs"
        :current-options="currentOptions"
        @update="setOption"
      />
    </SettingsSection>

    <SettingsSection
      v-if="horizontalDefs.length > 0"
      title="Horizontal Axis"
      :icon="IPhArrowsHorizontal"
    >
      <AxisGroup
        :defs="horizontalDefs"
        :current-options="currentOptions"
        @update="setOption"
      />
    </SettingsSection>
  </div>
  <p
    v-else
    class="text-muted small"
  >
    No axis options for this chart type.
  </p>
</template>

<script setup lang="ts">
import type { Component, FunctionalComponent } from 'vue'
import {
  FormControlButtonGroup,
  FormControlCheckbox,
  FormControlTextInput,
  FormControlNumberFormat,
  FormControlDateFormat,
  SettingsSection,
} from '@blueprint-chart/ui'
import type { ChartOptionDef } from '@blueprint-chart/lib'
import { ChartOptionType } from '@blueprint-chart/lib'
import { useChartTypeOptions, type ChartTypeOptionKey, type ChartTypeOptions } from '@/stores/chartTypeOptions'
import { useDataTable } from '@/stores/dataTable'
import IFluentLineSolid from '~icons/fluent/line-horizontal-1-20-filled'
import IFluentLineDashed from '~icons/fluent/line-horizontal-1-dashes-20-filled'
import IFluentLineDotted from '~icons/fluent/line-horizontal-1-dot-20-filled'
import IPhEyeSlash from '~icons/ph/eye-slash'
import IPhAlignLeft from '~icons/ph/align-left'
import IPhAlignRight from '~icons/ph/align-right'
import IPhMagicWand from '~icons/ph/magic-wand'
import IPhArrowsVertical from '~icons/ph/arrows-vertical'
import IPhArrowsHorizontal from '~icons/ph/arrows-horizontal'
import IPhArrowSquareIn from '~icons/ph/arrow-square-in'
import IPhArrowSquareOut from '~icons/ph/arrow-square-out'
import IPhChartLineUp from '~icons/ph/chart-line-up'
import IPhWaveSine from '~icons/ph/wave-sine'
import IPhTextAa from '~icons/ph/text-aa'

const hasValueLabels = computed(() => availableOptionKeys.value.includes('valueLabels'))
const hasSwapLabelValue = computed(() => availableOptionKeys.value.includes('swapLabelValue'))

const valueLabelPositionChoices = [
  { value: 'auto', text: 'Auto', icon: IPhMagicWand },
  { value: 'outside', text: 'Outside', icon: IPhArrowSquareOut },
  { value: 'inside', text: 'Inside', icon: IPhArrowSquareIn },
]

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

const { currentOptions, optionDefs, availableOptionKeys, setOption: _setOption } = useChartTypeOptions()

// Wrapper for dynamic key/value pairs emitted by AxisGroup — the generic
// setOption<K> requires a paired key-value type that cannot be statically
// verified when the key is a runtime ChartTypeOptionKey.
function setOption(key: ChartTypeOptionKey, value: unknown) {
  _setOption(key, value as ChartTypeOptions[typeof key])
}
const { displayColumnTypes } = useDataTable()

const labelColumnType = computed(() => displayColumnTypes.value[0] ?? 'string')
const valueColumnType = computed(() => displayColumnTypes.value[1] ?? 'number')

// Detect which axis is the value axis by checking for scaleType options
const verticalIsValueAxis = computed(() =>
  optionDefs.value.some(d => d.key === 'verticalScaleType'),
)

function shortenLabel(label: string): string {
  return label
    .replace(/^(Show\s+)?(vertical|horizontal)\s+/i, (_, show) => show ?? '')
    .replace(/^./, c => c.toUpperCase())
}

function axisDataType(isHorizontal: boolean): string {
  const isValueAxis = isHorizontal ? !verticalIsValueAxis.value : verticalIsValueAxis.value
  return isValueAxis ? valueColumnType.value : labelColumnType.value
}

function resolveFormatType(def: ChartOptionDef, isHorizontal: boolean): ChartOptionDef | null {
  if (def.type !== 'numberFormat') {
    return def
  }
  const colType = axisDataType(isHorizontal)
  if (colType === 'date') {
    return { ...def, type: ChartOptionType.DateFormat, label: def.label.replace(/number\s+format/i, 'Date format') }
  }
  if (colType === 'string') {
    return null
  }
  return def
}

const verticalDefs = computed(() =>
  optionDefs.value
    .filter(d => VERTICAL_KEYS.has(d.key))
    .map(d => resolveFormatType({ ...d, label: shortenLabel(d.label) }, false))
    .filter((d): d is ChartOptionDef => d !== null),
)

const horizontalDefs = computed(() =>
  optionDefs.value
    .filter(d => HORIZONTAL_KEYS.has(d.key))
    .map(d => resolveFormatType({ ...d, label: shortenLabel(d.label) }, true))
    .filter((d): d is ChartOptionDef => d !== null),
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
    const iconMap = ICON_MAPS[def.key]
    const options = def.choices.map(c => ({
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

  if (def.type === 'text') {
    return h(FormControlTextInput, {
      'label': def.label,
      'id': `opt-${def.key}`,
      'placeholder': def.placeholder ?? '',
      'modelValue': (value as string) ?? '',
      'onUpdate:modelValue': (v: string) => emit('update', v),
    })
  }

  if (def.type === 'numberFormat') {
    return h(FormControlNumberFormat, {
      'label': def.label,
      'id': `opt-${def.key}`,
      'modelValue': (value as string) ?? '',
      'onUpdate:modelValue': (v: string) => emit('update', v),
    })
  }

  if (def.type === 'dateFormat') {
    return h(FormControlDateFormat, {
      'label': def.label,
      'id': `opt-${def.key}`,
      'modelValue': (value as string) ?? '',
      'onUpdate:modelValue': (v: string) => emit('update', v),
    })
  }

  return null
}

AxisOption.props = ['def', 'value']
AxisOption.emits = ['update']

function isRangeMin(key: string): boolean {
  return key.endsWith('RangeMin')
}
function isRangeMax(key: string): boolean {
  return key.endsWith('RangeMax')
}

const AxisGroup: FunctionalComponent<{
  defs: ChartOptionDef[]
  currentOptions: Record<string, unknown>
}, { update: [key: ChartTypeOptionKey, value: unknown] }> = (props, { emit }) => {
  const children: ReturnType<typeof h>[] = []
  const { defs, currentOptions } = props
  let i = 0
  while (i < defs.length) {
    const def = defs[i]
    // Pair RangeMin + RangeMax on the same row
    if (isRangeMin(def.key) && i + 1 < defs.length && isRangeMax(defs[i + 1].key)) {
      const maxDef = defs[i + 1]
      children.push(
        h('div', { class: 'd-flex gap-2', key: def.key }, [
          h('div', { class: 'flex-fill', style: 'min-width:0' }, [
            h(AxisOption, {
              def,
              value: currentOptions[def.key as ChartTypeOptionKey],
              onUpdate: (v: unknown) => emit('update', def.key as ChartTypeOptionKey, v),
            }),
          ]),
          h('div', { class: 'flex-fill', style: 'min-width:0' }, [
            h(AxisOption, {
              def: maxDef,
              value: currentOptions[maxDef.key as ChartTypeOptionKey],
              onUpdate: (v: unknown) => emit('update', maxDef.key as ChartTypeOptionKey, v),
            }),
          ]),
        ]),
      )
      i += 2
    }
    else {
      children.push(
        h(AxisOption, {
          key: def.key,
          def,
          value: currentOptions[def.key as ChartTypeOptionKey],
          onUpdate: (v: unknown) => emit('update', def.key as ChartTypeOptionKey, v),
        }),
      )
      i++
    }
  }
  return h('div', { class: 'd-flex flex-column gap-2' }, children)
}
AxisGroup.props = ['defs', 'currentOptions']
AxisGroup.emits = ['update']
</script>
