<script setup lang="ts">
defineProps<{
  title?: string
  message?: string
}>()
</script>

<template>
  <div class="feedback-empty-state">
    <span
      v-if="$slots.icon"
      class="feedback-empty-state__icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </span>
    <h2
      v-if="title"
      class="feedback-empty-state__title"
    >
      {{ title }}
    </h2>
    <p
      v-if="message || $slots.default"
      class="feedback-empty-state__message"
    >
      <slot>{{ message }}</slot>
    </p>
    <div
      v-if="$slots.actions"
      class="feedback-empty-state__actions"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.feedback-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem 1rem;
  text-align: center;

  &__icon {
    display: inline-flex;
    color: var(--bs-secondary-color);

    :slotted(svg) {
      width: 2rem;
      height: 2rem;
    }
  }

  &__title {
    margin: 0;
    font-size: var(--bs-body-font-size);
    font-weight: 600;
  }

  &__message {
    margin: 0;
    font-size: var(--bs-font-size-sm);
    color: var(--bs-secondary-color);
  }

  &__actions {
    margin-top: 0.5rem;
  }
}
</style>
