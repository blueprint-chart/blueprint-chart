<template>
  <div
    class="landing-section-header"
    :class="{ 'landing-section-header--center': center }"
  >
    <div class="landing-section-header__label">
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

<style scoped>
.landing-section-header__label {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--bs-primary);
  margin-bottom: 0.5rem;
}

.landing-section-header__title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(1.625rem, 3vw, 2.375rem);
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--bs-body-color);
  margin-bottom: 0.875rem;

  :deep(em) {
    font-style: italic;
  }
}

.landing-section-header__lead {
  font-size: 1rem;
  color: var(--bs-secondary-color);
  max-width: 35rem;
  line-height: 1.7;
  margin-bottom: 2.5rem;
}

.landing-section-header--center {
  text-align: center;
  max-width: 37.5rem;
  margin: 0 auto 3rem;

  .landing-section-header__lead {
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 0;
  }
}
</style>
