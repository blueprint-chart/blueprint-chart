<template>
  <section
    :id="id"
    class="landing-section"
    :class="{
      'landing-section--dark': dark,
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
}>(), {
  id: undefined,
  dark: false,
  full: false,
})
</script>

<style scoped>
.landing-section {
  padding: 4.5rem clamp(1rem, 5vw, 3.75rem);
}

.landing-section__inner {
  max-width: 70rem;
  margin: 0 auto;
}

.landing-section--dark {
  background: #1a1a2e;
  color: var(--bs-body-color);
}

[data-bs-theme="dark"] .landing-section--dark {
  background: #0e0e14;
}
</style>
