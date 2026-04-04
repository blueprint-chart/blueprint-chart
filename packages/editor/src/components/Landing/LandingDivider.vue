<template>
  <div class="landing-divider">
    <hr class="landing-divider__line">
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'LandingDivider' })
</script>

<style scoped lang="scss">
.landing-divider {
  max-width: 70rem;
  margin: 0 auto;
  padding: 0 clamp(1rem, 5vw, 3.75rem);

  &__line {
    border: none;
    border-top: 1px solid var(--bs-border-color);
    margin: 0;
  }
}
</style>
