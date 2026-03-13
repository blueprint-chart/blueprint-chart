<template>
  <div class="bullet-point">
    <div class="bullet-point__dot" />
    <div>
      <strong class="bullet-point__title">{{ title }}</strong>
      <p class="bullet-point__desc">
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<style scoped lang="scss">
.bullet-point {
  display: flex;
  gap: 0.875rem;
  align-items: flex-start;

  &__dot {
    min-width: 0.5rem;
    height: 0.5rem;
    background: var(--bs-primary);
    border-radius: 50%;
    margin-top: 0.5rem;
  }

  &__title {
    font-size: var(--bs-font-size-md);
  }

  &__desc {
    font-size: var(--bs-font-size-sm);
    color: var(--bs-secondary-color);
    margin-top: 0.125rem;
    line-height: 1.6;
  }
}
</style>
