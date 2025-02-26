<script setup lang="ts">
import FormControlTextInput from './FormControlTextInput.vue'
</script>

<template>
  <Story title="Form/FormControl/FormControlTextInput">
    <Variant
      title="Default"
      :init-state="() => ({ value: 'Hello', label: 'Title' })"
    >
      <template #default="{ state }">
        <FormControlTextInput
          id="story-text-input"
          v-model="state.value"
          :label="state.label"
        />
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.value"
          title="modelValue"
        />
        <HstText
          v-model="state.label"
          title="label"
        />
      </template>
    </Variant>
    <Variant
      title="With Suffix"
      :init-state="() => ({ value: '12', label: 'Width', suffix: 'px' })"
    >
      <template #default="{ state }">
        <FormControlTextInput
          id="story-text-input-suffix"
          v-model="state.value"
          :label="state.label"
          :suffix="state.suffix"
        />
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.value"
          title="modelValue"
        />
        <HstText
          v-model="state.suffix"
          title="suffix"
        />
      </template>
    </Variant>
  </Story>
</template>
