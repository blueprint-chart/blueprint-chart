<script setup lang="ts">
import ColorSwatch from './DisplayColorSwatch.vue'
</script>

<template>
  <Story title="Display/DisplayColorSwatch">
    <Variant
      title="Default"
      :init-state="() => ({ color: '#4e79a7', size: 'md' })"
    >
      <template #default="{ state }">
        <ColorSwatch
          :color="state.color"
          :size="state.size"
        />
      </template>
      <template #controls="{ state }">
        <HstText
          v-model="state.color"
          title="color"
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
