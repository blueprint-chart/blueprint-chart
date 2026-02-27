<template>
  <span
    class="display-contrast-badge"
    :class="badgeClass"
  >
    {{ level }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  level: 'AAA' | 'AA' | 'Fail'
}>()

const badgeClass = computed(() => ({
  'display-contrast-badge--aaa': props.level === 'AAA',
  'display-contrast-badge--aa': props.level === 'AA',
  'display-contrast-badge--fail': props.level === 'Fail',
}))
</script>

<style scoped lang="scss">
.display-contrast-badge {
  display: inline-block;
  padding: 0.1em 0.4em;
  font-size: 0.625rem;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-radius: var(--bs-border-radius-sm);

  &--aaa {
    background-color: var(--bs-success-bg-subtle);
    color: var(--bs-success-text-emphasis);
  }

  &--aa {
    background-color: var(--bs-warning-bg-subtle);
    color: var(--bs-warning-text-emphasis);
  }

  &--fail {
    background-color: var(--bs-danger-bg-subtle);
    color: var(--bs-danger-text-emphasis);
  }
}
</style>
