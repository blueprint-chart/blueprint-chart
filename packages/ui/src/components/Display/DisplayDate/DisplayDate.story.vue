<script setup lang="ts">
import DisplayDate from './DisplayDate.vue'
</script>

<template>
  <Story title="Display/DisplayDate">
    <Variant
      title="Default"
      :init-state="() => ({ value: '2025-06-15', format: 'short' })"
    >
      <template #default="{ state }">
        <DisplayDate
          :value="state.value"
          :format="state.format"
        />
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.value"
          title="value"
        />
        <HstSelect
          v-model="state.format"
          title="format"
          :options="['short', 'long']"
        />
      </template>
    </Variant>
  </Story>
</template>
