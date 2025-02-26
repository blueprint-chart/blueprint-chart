<script setup lang="ts">
import FormControlSliderInput from './FormControlSliderInput.vue'
</script>

<template>
  <Story title="Form/FormControl/FormControlSliderInput">
    <Variant
      title="Default"
      :init-state="() => ({ value: '50', label: 'Amount', min: '0', max: '100', step: '1', suffix: '%' })"
    >
      <template #default="{ state }">
        <FormControlSliderInput
          id="story-slider"
          v-model="state.value"
          :label="state.label"
          :min="state.min"
          :max="state.max"
          :step="state.step"
          :suffix="state.suffix"
        />
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.value"
          title="modelValue"
        />
        <HstText
          v-model="state.min"
          title="min"
        />
        <HstText
          v-model="state.max"
          title="max"
        />
        <HstText
          v-model="state.step"
          title="step"
        />
        <HstText
          v-model="state.suffix"
          title="suffix"
        />
      </template>
    </Variant>
  </Story>
</template>
