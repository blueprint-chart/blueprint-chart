<template>
  <section
    :id="id"
    class="landing-section"
    :class="{
      'landing-section--dark': dark,
      'landing-section--full': full,
      'landing-section--bordered': bordered,
      [`landing-section--surface-${surface}`]: true,
    }"
    :data-bs-theme="dark ? 'dark' : undefined"
  >
    <div class="landing-section__inner">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  id?: string
  dark?: boolean
  full?: boolean
  bordered?: boolean
  surface?: 'chrome' | 'content'
}>(), {
  id: undefined,
  dark: false,
  full: false,
  bordered: true,
  surface: 'chrome',
})
</script>

<style scoped lang="scss">
.landing-section {
  padding: 4.5rem clamp(1rem, 5vw, 3.75rem);

  &__inner {
    max-width: 70rem;
    margin: 0 auto;
  }

  &--bordered {
    border-top: 1px solid var(--bc-hairline);
  }

  &--surface-chrome {
    background: var(--bc-chrome-bg);
  }

  &--surface-content {
    background: var(--bc-content-bg);
  }

  &--dark {
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
  }
}

[data-bs-theme="dark"] .landing-section--dark {
  background: var(--bc-content-bg);
}
</style>
