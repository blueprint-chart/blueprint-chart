<script setup lang="ts">
import FormControlNumberFormat from './FormControlNumberFormat.vue'
</script>

<template>
  <Story title="Form/FormControl/FormControlNumberFormat">
    <Variant
      title="Default"
      :init-state="() => ({ value: '' })"
    >
      <template #default="{ state }">
        <FormControlNumberFormat
          id="story-numfmt"
          v-model="state.value"
          label="Number format"
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
      title="With preset"
      :init-state="() => ({ value: ',.0f' })"
    >
      <template #default="{ state }">
        <FormControlNumberFormat
          id="story-numfmt-preset"
          v-model="state.value"
          label="Number format"
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
      title="Percentage"
      :init-state="() => ({ value: '.1%' })"
    >
      <template #default="{ state }">
        <FormControlNumberFormat
          id="story-numfmt-pct"
          v-model="state.value"
          label="Number format"
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
