<template>
  <div class="settings-section-icon">
    <AppIcon :name="icon" />
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import AppIcon from '../App/AppIcon/AppIcon.vue'

defineProps<{
  icon: Component
}>()
</script>

<style scoped lang="scss">
.settings-section-icon {
  flex-shrink: 0;
  text-align: center;
  color: var(--bs-secondary-color);

  :deep(.app-icon) {
    font-size: 1.25rem;
  }
}
</style>
