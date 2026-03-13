<template>
  <span class="landing-badge">
    <AppIcon
      :name="IPhCheck"
      size="xs"
      variant="success"
    />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { AppIcon } from '@blueprint-chart/ui'
import IPhCheck from '~icons/ph/check'

defineProps<{
  label: string
}>()
</script>

<style scoped>
.landing-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: var(--bs-font-size-sm);
  color: var(--bs-secondary-color);
}
</style>
