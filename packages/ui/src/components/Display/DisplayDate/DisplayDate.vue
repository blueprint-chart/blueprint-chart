<template>
  <span class="display-date">{{ formatted }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  value: string
  format?: 'short' | 'long'
}>(), {
  format: 'short',
})

const formatted = computed(() => {
  const date = new Date(props.value)
  if (Number.isNaN(date.getTime())) { return props.value }
  if (props.format === 'long') {
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  }
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
})
</script>

<style scoped lang="scss">
.display-date {
  font-size: 0.8125rem;
  color: var(--bs-secondary-color);
}
</style>
