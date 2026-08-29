<template>
  <div class="d-flex flex-column gap-3">
    <BFormGroup
      label="Symbol"
      :label-for="`${idPrefix}-shape`"
    >
      <BFormSelect
        :id="`${idPrefix}-shape`"
        :model-value="shape"
        :options="shapeChoices"
        @update:model-value="$emit('update:shape', String($event))"
      />
    </BFormGroup>

    <FormControlButtonGroup
      label="Show on"
      :model-value="showOn"
      :options="showOnChoices"
      @update:model-value="$emit('update:showOn', $event)"
    />

    <FormControlButtonGroup
      label="Style"
      :model-value="style"
      :options="styleChoices"
      @update:model-value="$emit('update:style', $event)"
    />

    <FormControlSliderInput
      :id="`${idPrefix}-size`"
      label="Size"
      :model-value="size"
      min="0.5"
      max="10"
      step="0.5"
      @update:model-value="$emit('update:size', String($event))"
    />

    <FormControlSliderInput
      :id="`${idPrefix}-opacity`"
      label="Opacity"
      :model-value="opacity"
      min="0"
      max="1"
      step="0.1"
      @update:model-value="$emit('update:opacity', String($event))"
    />
  </div>
</template>

<script setup lang="ts">
import { FormControlButtonGroup, FormControlSliderInput } from '@blueprint-chart/ui'

withDefaults(defineProps<{
  shape: string
  showOn: string
  style: string
  size: string
  opacity: string
  idPrefix?: string
}>(), {
  idPrefix: 'symbol',
})

defineEmits<{
  'update:shape': [value: string]
  'update:showOn': [value: string]
  'update:style': [value: string]
  'update:size': [value: string]
  'update:opacity': [value: string]
}>()

const shapeChoices = [
  { value: 'circle', text: 'Circle' },
  { value: 'square', text: 'Square' },
  { value: 'diamond', text: 'Diamond' },
  { value: 'triangle', text: 'Triangle Up' },
  { value: 'triangleDown', text: 'Triangle Down' },
  { value: 'cross', text: 'Cross' },
  { value: 'star', text: 'Star' },
]

const showOnChoices = [
  { value: 'firstLast', text: 'First & Last' },
  { value: 'first', text: 'First' },
  { value: 'last', text: 'Last' },
  { value: 'all', text: 'All' },
]

const styleChoices = [
  { value: 'filled', text: 'Filled' },
  { value: 'hollow', text: 'Hollow' },
]
</script>
