<template>
  <div class="feedback-empty-state">
    <p class="feedback-empty-state__message">
      <slot>{{ message }}</slot>
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>

<style scoped lang="scss">
.feedback-empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--bs-secondary-color);
  font-size: 0.8125rem;
}
</style>
