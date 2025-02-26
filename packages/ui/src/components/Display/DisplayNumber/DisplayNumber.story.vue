<script setup lang="ts">
import DisplayNumber from './DisplayNumber.vue'
</script>

<template>
  <Story title="Display/DisplayNumber">
    <Variant
      title="Default"
      :init-state="() => ({ value: 3.14159, precision: '2', unit: '%' })"
    >
      <template #default="{ state }">
        <DisplayNumber
          :value="Number(state.value)"
          :precision="state.precision ? Number(state.precision) : undefined"
          :unit="state.unit"
        />
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.value"
          title="value"
        />
        <HstText
          v-model="state.precision"
          title="precision"
        />
        <HstText
          v-model="state.unit"
          title="unit"
        />
      </template>
    </Variant>
  </Story>
</template>
