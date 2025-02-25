<template>
  <div class="d-flex flex-column gap-3">
    <FormControlButtonGroup
      v-if="hasLegend"
      label="Labels"
      :model-value="labelMode"
      :options="labelModeChoices"
      block
      @update:model-value="onLabelModeChange"
    />

    <FormControlButtonGroup
      v-if="hasDirectLabelStyle && labelMode === 'direct'"
      label="Direct label style"
      :model-value="currentOptions.directLabelling || 'auto'"
      :options="directLabelStyleChoices"
      block
      @update:model-value="(v) => setOption('directLabelling', v)"
    />

    <FormControlButtonGroup
      v-if="hasDirectLabelAnchor && labelMode === 'direct' && currentOptions.directLabelling === 'inside'"
      label="Label anchor"
      :model-value="currentOptions.directLabelAnchor || 'middle'"
      :options="directLabelAnchorChoices"
      block
      @update:model-value="(v) => setOption('directLabelAnchor', v)"
    />

    <FormControlButtonGroup
      v-if="hasLegendPosition && labelMode === 'legend'"
      label="Legend position"
      :model-value="currentOptions.legendPosition ?? 'top'"
      :options="legendPositionChoices"
      block
      @update:model-value="(v) => setOption('legendPosition', v)"
    />

    <FormControlButtonGroup
      v-if="hasLegendAnchor && labelMode === 'legend'"
      label="Legend anchor"
      :model-value="currentOptions.legendAnchor ?? 'start'"
      :options="legendAnchorChoices"
      block
      @update:model-value="(v) => setOption('legendAnchor', v)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChartTypeOptions } from '@/composables/useChartTypeOptions'
import { FormControlButtonGroup } from '@blueprint-chart/ui'

const { currentOptions, availableOptionKeys, setOption } = useChartTypeOptions()

const hasLegend = computed(() => availableOptionKeys.value.includes('legend'))
const hasLegendPosition = computed(() => availableOptionKeys.value.includes('legendPosition'))
const hasLegendAnchor = computed(() => availableOptionKeys.value.includes('legendAnchor'))
const hasDirectLabelling = computed(() => availableOptionKeys.value.includes('directLabelling'))
const hasDirectLabelStyle = computed(() => hasDirectLabelling.value)
const hasDirectLabelAnchor = computed(() => availableOptionKeys.value.includes('directLabelAnchor'))

const labelMode = computed(() => {
  if (currentOptions.value.directLabelling) return 'direct'
  if (currentOptions.value.legend === false) return 'none'
  return 'legend'
})

const labelModeChoices = computed(() => {
  const choices = [
    { value: 'legend', text: 'Legend' },
    { value: 'none', text: 'None' },
  ]
  if (hasDirectLabelling.value) {
    choices.splice(1, 0, { value: 'direct', text: 'Direct labelling' })
  }
  return choices
})

function onLabelModeChange(value: string) {
  if (value === 'legend') {
    setOption('legend', true)
    setOption('directLabelling', '')
  }
  else if (value === 'direct') {
    setOption('legend', false)
    setOption('directLabelling', 'auto')
  }
  else {
    setOption('legend', false)
    setOption('directLabelling', '')
  }
}

const directLabelStyleChoices = [
  { value: 'auto', text: 'Auto' },
  { value: 'outside', text: 'Outside' },
  { value: 'inside', text: 'Inside' },
]
const directLabelAnchorChoices = [
  { value: 'start', text: 'Start' },
  { value: 'middle', text: 'Middle' },
  { value: 'end', text: 'End' },
]

const legendPositionChoices = [
  { value: 'top', text: 'Top' },
  { value: 'bottom', text: 'Bottom' },
  { value: 'left', text: 'Left' },
  { value: 'right', text: 'Right' },
]
const legendAnchorChoices = [
  { value: 'start', text: 'Start' },
  { value: 'middle', text: 'Middle' },
  { value: 'end', text: 'End' },
]
</script>
