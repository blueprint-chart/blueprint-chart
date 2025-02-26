<script setup lang="ts">
import DisplayRange from './DisplayRange.vue'
</script>

<template>
  <Story title="Display/DisplayRange">
    <Variant
      title="Default"
      :init-state="() => ({ min: '0', max: '100', unit: 'px' })"
    >
      <template #default="{ state }">
        <DisplayRange
          :min="state.min"
          :max="state.max"
          :unit="state.unit"
        />
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.min"
          title="min"
        />
        <HstText
          v-model="state.max"
          title="max"
        />
        <HstText
          v-model="state.unit"
          title="unit"
        />
      </template>
    </Variant>
  </Story>
</template>
