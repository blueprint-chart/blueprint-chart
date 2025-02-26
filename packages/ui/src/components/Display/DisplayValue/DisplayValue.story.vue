<script setup lang="ts">
import DisplayValue from './DisplayValue.vue'
</script>

<template>
  <Story title="Display/DisplayValue">
    <Variant
      title="Default"
      :init-state="() => ({ value: '42', unit: 'px', size: 'md' })"
    >
      <template #default="{ state }">
        <DisplayValue
          :value="state.value"
          :unit="state.unit"
          :size="state.size"
        />
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.value"
          title="value"
        />
        <HstText
          v-model="state.unit"
          title="unit"
        />
        <HstSelect
          v-model="state.size"
          title="size"
          :options="['sm', 'md']"
        />
      </template>
    </Variant>
  </Story>
</template>
