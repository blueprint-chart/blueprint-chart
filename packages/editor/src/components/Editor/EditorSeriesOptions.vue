<template>
  <div class="d-flex flex-column gap-3">
    <small class="text-muted">
      Editing {{ selected.length }} series{{ selected.length > 1 ? '' : `: ${selected[0]}` }}
    </small>

    <FormControlColorInput
      id="series-color"
      label="Color"
      :model-value="currentColor"
      @update:model-value="(v) => applyToSelected('color', v)"
    />

    <FormControlButtonGroup
      label="Label mode"
      :model-value="currentLabelMode"
      :options="labelModeChoices"
      block
      @update:model-value="(v) => applyToSelected('labelMode', v)"
    />

    <FormControlCheckbox
      :model-value="currentValueLabels"
      label="Value labels"
      @update:model-value="(v) => applyToSelected('valueLabels', v)"
    />

    <FormControlSliderInput
      v-if="isBar"
      id="series-opacity"
      label="Opacity"
      :model-value="currentOpacity"
      min="0"
      max="1"
      step="0.1"
      @update:model-value="(v) => applyToSelected('opacity', Number(v))"
    />

    <template v-if="isLine">
      <FormControlButtonGroup
        label="Line width"
        :model-value="currentWidth"
        :options="widthOptions"
        @update:model-value="(v) => applyToSelected('lineWidth', Number(v))"
      />

      <FormControlButtonGroup
        label="Dash style"
        :model-value="currentDash"
        :options="dashOptions"
        @update:model-value="(v) => applyToSelected('dash', v)"
      />

      <BFormGroup
        label="Interpolation"
        label-for="series-interpolation"
      >
        <BFormSelect
          id="series-interpolation"
          :model-value="currentInterpolation"
          :options="interpolationChoices"
          @update:model-value="(v) => applyToSelected('interpolation', v)"
        />
      </BFormGroup>

      <FormControlCheckbox
        :model-value="currentLineSymbols"
        label="Line symbols"
        @update:model-value="(v) => applyToSelected('lineSymbols', v)"
      />

      <EditorSymbolOptions
        v-if="currentLineSymbols"
        id-prefix="series-symbol"
        :shape="currentSymbolShape"
        :show-on="currentSymbolShowOn"
        :style="currentSymbolStyle"
        :size="currentSymbolSize"
        :opacity="currentSymbolOpacity"
        @update:shape="(v) => applyToSelected('symbolShape', v)"
        @update:show-on="(v) => applyToSelected('symbolShowOn', v)"
        @update:style="(v) => applyToSelected('symbolStyle', v)"
        @update:size="(v) => applyToSelected('symbolSize', Number(v))"
        @update:opacity="(v) => applyToSelected('symbolOpacity', Number(v))"
      />
    </template>

    <div class="d-flex gap-2 justify-content-end">
      <BButton
        v-if="selected.length > 1"
        variant="outline-secondary"
        size="sm"
        @click="copyFromFirst"
      >
        Copy from first
      </BButton>
      <BButton
        variant="outline-danger"
        size="sm"
        @click="resetSelected"
      >
        Reset to default
      </BButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SeriesOverride } from '@blueprint-chart/lib'
import { FormControlColorInput, FormControlButtonGroup, FormControlCheckbox, FormControlSliderInput } from '@blueprint-chart/ui'
import EditorSymbolOptions from './EditorSymbolOptions.vue'

const props = defineProps<{
  selected: string[]
  overrides: SeriesOverride[]
  colors: string[]
  chartType: string
}>()

const emit = defineEmits<{
  'update:overrides': [value: SeriesOverride[]]
}>()

function getOverride(name: string): SeriesOverride | undefined {
  return props.overrides.find(o => o.name === name)
}

function firstSelected(): SeriesOverride | undefined {
  return props.selected.length > 0 ? getOverride(props.selected[0]) : undefined
}

const isBar = computed(() => props.chartType === 'bar-multi')
const isLine = computed(() => props.chartType === 'line-multi')

const currentColor = computed(() => firstSelected()?.color ?? '#4e79a7')
const currentOpacity = computed(() => String(firstSelected()?.opacity ?? 1))
const currentWidth = computed(() => String(firstSelected()?.lineWidth ?? 2))
const currentDash = computed(() => firstSelected()?.dash ?? 'solid')
const currentInterpolation = computed(() => firstSelected()?.interpolation ?? 'global')
const currentLabelMode = computed(() => firstSelected()?.labelMode ?? 'global')
const currentValueLabels = computed(() => firstSelected()?.valueLabels ?? false)
const currentLineSymbols = computed(() => firstSelected()?.lineSymbols ?? false)
const currentSymbolShape = computed(() => firstSelected()?.symbolShape ?? 'circle')
const currentSymbolShowOn = computed(() => firstSelected()?.symbolShowOn ?? 'firstLast')
const currentSymbolStyle = computed(() => firstSelected()?.symbolStyle ?? 'filled')
const currentSymbolSize = computed(() => String(firstSelected()?.symbolSize ?? 3.5))
const currentSymbolOpacity = computed(() => String(firstSelected()?.symbolOpacity ?? 1))

function applyToSelected(key: keyof SeriesOverride, value: unknown) {
  const copy = props.overrides.map(o => ({ ...o }))
  for (const name of props.selected) {
    let entry = copy.find(o => o.name === name)
    if (!entry) {
      entry = { name }
      copy.push(entry)
    }
    ;(entry as Record<string, unknown>)[key] = value
  }
  emit('update:overrides', copy)
}

function copyFromFirst() {
  if (props.selected.length < 2) return
  const source = getOverride(props.selected[0])
  if (!source) return
  const copy = props.overrides.map(o => ({ ...o }))
  for (let i = 1; i < props.selected.length; i++) {
    const name = props.selected[i]
    let entry = copy.find(o => o.name === name)
    if (!entry) {
      entry = { name }
      copy.push(entry)
    }
    Object.assign(entry, { ...source, name })
  }
  emit('update:overrides', copy)
}

function resetSelected() {
  const selectedSet = new Set(props.selected)
  const copy = props.overrides.filter(o => !selectedSet.has(o.name))
  emit('update:overrides', copy)
}

const widthOptions = [
  { value: '1', text: '1' },
  { value: '2', text: '2' },
  { value: '3', text: '3' },
  { value: '4', text: '4' },
  { value: '5', text: '5' },
]

const dashOptions = [
  { value: 'solid', text: 'Solid' },
  { value: 'dotted', text: 'Dotted' },
  { value: 'dashed', text: 'Dashed' },
  { value: 'dash-dot', text: 'Dash-dot' },
]

const interpolationChoices = [
  { value: 'global', text: 'Global' },
  { value: 'linear', text: 'Linear' },
  { value: 'monotoneX', text: 'Monotone' },
  { value: 'step', text: 'Step' },
  { value: 'stepBefore', text: 'Step (before)' },
  { value: 'stepAfter', text: 'Step (after)' },
  { value: 'basis', text: 'Basis' },
  { value: 'cardinal', text: 'Cardinal' },
  { value: 'catmullRom', text: 'Catmull-Rom' },
]

const labelModeChoices = [
  { value: 'global', text: 'Global' },
  { value: 'legend', text: 'Legend' },
  { value: 'direct', text: 'Direct' },
  { value: 'none', text: 'None' },
]

</script>
