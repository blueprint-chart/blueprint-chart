<script setup lang="ts">
import FormControlColorInput from './FormControlColorInput.vue'
</script>

<template>
  <Story title="Form/FormControl/FormControlColorInput">
    <Variant
      title="Default"
      :init-state="() => ({ color: '#3b82f6', label: 'Pick a color' })"
    >
      <template #default="{ state }">
        <FormControlColorInput
          id="story-color"
          v-model="state.color"
          :label="state.label"
        />
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.color"
          title="modelValue"
        />
        <HstText
          v-model="state.label"
          title="label"
        />
      </template>
    </Variant>
  </Story>
</template>
