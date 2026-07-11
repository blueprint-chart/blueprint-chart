<template>
  <div
    class="landing-section-header"
    :class="{ 'landing-section-header--center': center }"
  >
    <div class="landing-section-header__label bc-eyebrow">
      <span
        class="bc-eyebrow__hash"
        aria-hidden="true"
      >#</span>
      {{ label }}
    </div>
    <h2 class="landing-section-header__title">
      <slot />
    </h2>
    <p
      v-if="$slots.lead"
      class="landing-section-header__lead"
    >
      <slot name="lead" />
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  center?: boolean
}>(), {
  center: false,
})
</script>

<style scoped lang="scss">
.landing-section-header {
  &__label {
    margin-bottom: 0.625rem;
  }

  &__title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(1.5rem, 3vw, 2.5rem);
    font-weight: 400;
    line-height: 1.15;
    letter-spacing: -0.01em;
    color: var(--bs-body-color);
    margin-bottom: 0.875rem;

    :deep(em) {
      font-style: italic;
      color: var(--bc-accent);
    }
  }

  &__lead {
    font-size: 1rem;
    color: var(--bs-secondary-color);
    max-width: 35rem;
    line-height: 1.7;
    margin-bottom: 2.5rem;
  }

  &--center {
    text-align: center;
    max-width: 37.5rem;
    margin: 0 auto 3rem;

    .landing-section-header__lead {
      margin-left: auto;
      margin-right: auto;
      margin-bottom: 0;
    }
  }
}
</style>
