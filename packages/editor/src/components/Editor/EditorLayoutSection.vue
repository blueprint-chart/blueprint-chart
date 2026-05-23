<template>
  <div class="d-flex flex-column gap-3">
    <FormControlButtonGroup
      v-model="sizing"
      label="Width"
      :options="sizingOptions"
      block
    >
      <template #section:fixed>
        <div class="pt-2">
          <FormControlSliderInput
            id="layout-fixed-width"
            v-model="fixedWidthStr"
            label=""
            min="200"
            max="1200"
            suffix="px"
          />
        </div>
      </template>
      <template #section:max-width>
        <div class="pt-2">
          <FormControlSliderInput
            id="layout-max-width"
            v-model="maxWidthStr"
            label=""
            min="200"
            max="1200"
            suffix="px"
          />
        </div>
      </template>
    </FormControlButtonGroup>

    <FormControlButtonGroup
      v-model="heightMode"
      label="Height"
      :options="heightModeOptions"
      block
    >
      <template #section:fixed>
        <div class="pt-2">
          <FormControlSliderInput
            id="layout-fixed-height"
            v-model="fixedHeightStr"
            label=""
            min="100"
            max="800"
            suffix="px"
          />
        </div>
      </template>
      <template #section:aspect-ratio>
        <div class="pt-2">
          <FormControlDropdown
            id="layout-aspect-ratio"
            v-model="aspectRatio"
            :options="aspectRatioOptions"
            block
          />
        </div>
      </template>
    </FormControlButtonGroup>

    <FormControlSliderInput
      id="layout-padding"
      v-model="paddingStr"
      label="Padding"
      min="0"
      max="80"
      suffix="px"
    />

    <FormControlCheckbox
      v-model="transparentBackground"
      label="Transparent background"
    />
  </div>
</template>

<script setup lang="ts">
import { FormControlButtonGroup, FormControlSliderInput, FormControlDropdown, FormControlCheckbox } from '@blueprint-chart/ui'
import { useChartConfig } from '@/stores/chartConfig'

const { layout } = useChartConfig()

const sizing = computed({
  get: () => layout.value.sizing,
  set: (v) => { layout.value.sizing = v },
})

const heightMode = computed({
  get: () => layout.value.heightMode,
  set: (v) => { layout.value.heightMode = v },
})

const fixedWidthStr = computed({
  get: () => String(layout.value.fixedWidth),
  set: (v) => { layout.value.fixedWidth = Number(v) || 600 },
})

const fixedHeightStr = computed({
  get: () => String(layout.value.fixedHeight),
  set: (v) => { layout.value.fixedHeight = Number(v) || 400 },
})

const paddingStr = computed({
  get: () => String(layout.value.padding),
  set: (v) => { layout.value.padding = Number(v) || 0 },
})

const aspectRatio = computed({
  get: () => layout.value.aspectRatio,
  set: (v) => { layout.value.aspectRatio = v },
})

const transparentBackground = computed({
  get: () => layout.value.transparentBackground,
  set: (v) => { layout.value.transparentBackground = v },
})

const maxWidthStr = computed({
  get: () => String(layout.value.maxWidth),
  set: (v) => { layout.value.maxWidth = Number(v) || 660 },
})

const sizingOptions = [
  { value: 'responsive', text: 'Responsive' },
  { value: 'max-width', text: 'Max width' },
  { value: 'fixed', text: 'Fixed' },
]

const heightModeOptions = [
  { value: 'auto', text: 'Auto' },
  { value: 'fixed', text: 'Fixed' },
  { value: 'aspect-ratio', text: 'Aspect ratio' },
]

const aspectRatioOptions = [
  { value: '16:9', label: '16:9' },
  { value: '4:3', label: '4:3' },
  { value: '3:2', label: '3:2' },
  { value: '1:1', label: '1:1' },
  { value: '2:3', label: '2:3' },
  { value: '9:16', label: '9:16' },
]

</script>
