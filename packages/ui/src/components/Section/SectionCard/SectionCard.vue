<template>
  <div class="section-card">
    <div
      v-if="label"
      class="section-card__label"
    >
      {{ label }}
    </div>
    <slot name="header" />
    <div
      v-if="$slots.default"
      class="section-card__body"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<style scoped lang="scss">
.section-card {
  background: var(--bs-tertiary-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: var(--bs-border-radius);
  overflow: hidden;

  &:has(&__label) {
    overflow: visible;
  }

  &__label {
    font-size: 0.625rem;
    color: var(--bs-secondary-color);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1;
    margin: -0.3125rem auto 0 auto;
    padding: 0 0.375rem;
    width: fit-content;
    text-shadow:
      -1px -1px 0 var(--bs-body-bg),
       1px -1px 0 var(--bs-body-bg),
      -1px  1px 0 var(--bs-body-bg),
       1px  1px 0 var(--bs-body-bg);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem 0.75rem;
  }
}
</style>
