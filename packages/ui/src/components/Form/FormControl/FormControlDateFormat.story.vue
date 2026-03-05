<script setup lang="ts">
import FormControlDateFormat from './FormControlDateFormat.vue'
</script>

<template>
  <Story title="Form/FormControl/FormControlDateFormat">
    <Variant
      title="Default (automatic)"
      :init-state="() => ({ value: '' })"
    >
      <template #default="{ state }">
        <FormControlDateFormat
          id="story-datefmt"
          v-model="state.value"
          label="Date format"
        />
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.value"
          title="modelValue"
        />
      </template>
    </Variant>

    <Variant
      title="Year only"
      :init-state="() => ({ value: '%Y' })"
    >
      <template #default="{ state }">
        <FormControlDateFormat
          id="story-datefmt-year"
          v-model="state.value"
          label="Date format"
        />
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.value"
          title="modelValue"
        />
      </template>
    </Variant>

    <Variant
      title="Custom format"
      :init-state="() => ({ value: '%b %d, %Y' })"
    >
      <template #default="{ state }">
        <FormControlDateFormat
          id="story-datefmt-custom"
          v-model="state.value"
          label="Date format"
        />
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.value"
          title="modelValue"
        />
      </template>
    </Variant>
  </Story>
</template>
