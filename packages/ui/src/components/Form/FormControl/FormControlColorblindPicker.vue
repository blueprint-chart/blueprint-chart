<template>
  <FormControlDropdown
    :id="id"
    v-model="model"
    :label="label"
    :options="options"
    block
  />
</template>

<script setup lang="ts">

defineProps<{
  label?: string
  id?: string
}>()

const model = defineModel<string>({ required: true })

const options = [
  { value: '', label: 'None' },
  { value: 'protanopia', label: 'Protanopia' },
  { value: 'deuteranopia', label: 'Deuteranopia' },
  { value: 'tritanopia', label: 'Tritanopia' },
]
</script>
